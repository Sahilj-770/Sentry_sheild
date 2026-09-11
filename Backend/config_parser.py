def parse_configuration(configuration, vendor):
    """
    Converts raw network configuration into
    standardized security-related information.
    """

    data = {
        "vendor": vendor,
        "hostname": None,

        # Remote access
        "telnet_enabled": False,
        "ssh_enabled": False,
        "http_enabled": False,

        # Logging and time
        "logging_configured": False,
        "logging_console_disabled": False,
        "centralized_logging_configured": False,
        "ntp_configured": False,

        # Security protocols
        "snmp_public": False,

        # Authentication
        "aaa_configured": False,
        "weak_password_policy": False,
        "password_min_length": None,
        "login_protection": False,

        # Credential security (NEVER store actual passwords)
        "has_plaintext_users": False,
        "plaintext_account_names": [],
        "has_privileged_plaintext_user": False,
        "has_weak_enable_password": False,

        # Cryptography & SSH details
        "ssh_configured": False,
        "ssh_v1_enabled": False,
        "rsa_key_modulus": None,
        "weak_rsa_key": False,

        # Access control lists
        "overly_permissive_acl": False,
        "permissive_acl_rules": [],

        # Services
        "unnecessary_services": False,

        # Junos / SSH management checks
        "ssh_root_login_allowed": False
    }

    # Remove comments before analysing the configuration.
    # Cisco uses "!" for comments.
    configuration_lines = []

    for line in configuration.splitlines():
        line = line.strip()

        if line.startswith("!"):
            continue

        if line:
            configuration_lines.append(line)

    # Rebuild configuration using only actual configuration lines
    clean_configuration = "\n".join(configuration_lines)
    configuration_lower = clean_configuration.lower()

    # =========================================================
    # CISCO
    # =========================================================
    if vendor == "Cisco":
        weak_passwords = {
            "12345", "123456", "1234", "cisco", "admin", "password",
            "test", "cisco123", "admin123", "pass"
        }
        other_unnecessary = False

        for line in configuration_lines:
            line_l = line.lower()
            tokens = line_l.split()
            raw_tokens = line.split()
            if not tokens:
                continue

            # Hostname
            if tokens[0] == "hostname" and len(raw_tokens) > 1:
                data["hostname"] = raw_tokens[1]

            # AAA
            if tokens[:2] == ["aaa", "new-model"]:
                data["aaa_configured"] = True
            elif tokens[:3] == ["no", "aaa", "new-model"]:
                data["aaa_configured"] = False

            # HTTP Management
            if tokens[:3] == ["ip", "http", "server"]:
                data["http_enabled"] = True
            elif tokens[:4] == ["no", "ip", "http", "server"]:
                data["http_enabled"] = False

            # Transport input (Telnet / SSH)
            if tokens[:2] == ["transport", "input"]:
                opts = tokens[2:]
                if "none" in opts:
                    data["telnet_enabled"] = False
                    data["ssh_enabled"] = False
                elif "all" in opts:
                    data["telnet_enabled"] = True
                    data["ssh_enabled"] = True
                    data["ssh_configured"] = True
                else:
                    if "telnet" in opts:
                        data["telnet_enabled"] = True
                    if "ssh" in opts:
                        data["ssh_enabled"] = True
                        data["ssh_configured"] = True
            elif tokens[:3] == ["no", "transport", "input"]:
                opts = tokens[3:]
                if not opts or "all" in opts:
                    data["telnet_enabled"] = False
                    data["ssh_enabled"] = False
                else:
                    if "telnet" in opts:
                        data["telnet_enabled"] = False
                    if "ssh" in opts:
                        data["ssh_enabled"] = False

            # SSH Protocol Version
            if tokens[:3] == ["ip", "ssh", "version"]:
                data["ssh_configured"] = True
                if len(tokens) > 3:
                    ver = tokens[3]
                    if ver in ["1", "v1"]:
                        data["ssh_v1_enabled"] = True
                    elif ver in ["2", "v2"]:
                        data["ssh_v1_enabled"] = False
                        data["ssh_enabled"] = True
            elif tokens[:2] == ["ip", "ssh"]:
                data["ssh_configured"] = True

            # Crypto Key RSA Modulus
            if tokens[:4] == ["crypto", "key", "generate", "rsa"]:
                data["ssh_configured"] = True
                if "modulus" in tokens:
                    m_idx = tokens.index("modulus")
                    if m_idx + 1 < len(tokens):
                        try:
                            mod = int(tokens[m_idx + 1])
                            data["rsa_key_modulus"] = mod
                            if mod < 2048:
                                data["weak_rsa_key"] = True
                        except ValueError:
                            pass

            # SNMP Public Community
            if tokens[:3] == ["snmp-server", "community", "public"]:
                data["snmp_public"] = True
            elif tokens[:4] == ["no", "snmp-server", "community", "public"]:
                data["snmp_public"] = False
            elif tokens[:2] == ["no", "snmp-server"]:
                data["snmp_public"] = False

            # Logging: Console vs Centralized/Remote
            if tokens[:3] == ["no", "logging", "console"]:
                data["logging_console_disabled"] = True

            if tokens[0] == "logging":
                if len(tokens) > 1:
                    sub = tokens[1]
                    if sub in ["host", "server", "buffered", "on", "trap"]:
                        data["logging_configured"] = True
                        if sub in ["host", "server", "buffered"]:
                            data["centralized_logging_configured"] = True
                    elif sub not in ["synchronous", "console", "monitor", "rate-limit", "userinfo"]:
                        # e.g., logging 10.0.0.50
                        data["logging_configured"] = True
                        data["centralized_logging_configured"] = True
            elif tokens[:2] == ["no", "logging"]:
                if len(tokens) == 2 or (len(tokens) > 2 and tokens[2] in ["on", "host", "server"]):
                    data["logging_configured"] = False
                    data["centralized_logging_configured"] = False

            # NTP
            if tokens[:2] in [["ntp", "server"], ["ntp", "peer"]]:
                data["ntp_configured"] = True
            elif tokens[:2] == ["no", "ntp"]:
                data["ntp_configured"] = False

            # Login Protection
            if tokens[:2] in [["login", "block-for"], ["login", "delay"], ["login", "quiet-mode"]]:
                data["login_protection"] = True
            elif tokens[:2] == ["no", "login"]:
                data["login_protection"] = False

            # Minimum Password Length Policy
            if tokens[:3] == ["security", "passwords", "min-length"]:
                if len(tokens) > 3:
                    try:
                        min_len = int(tokens[3])
                        data["password_min_length"] = min_len
                        if min_len < 10:
                            data["weak_password_policy"] = True
                    except ValueError:
                        pass

            # User Credentials & Privileges (NEVER store password values)
            if tokens[0] == "username" and len(raw_tokens) > 2:
                username_str = raw_tokens[1]
                privilege_level = 1
                if "privilege" in tokens:
                    p_idx = tokens.index("privilege")
                    if p_idx + 1 < len(tokens):
                        try:
                            privilege_level = int(tokens[p_idx + 1])
                        except ValueError:
                            pass

                if "password" in tokens:
                    data["has_plaintext_users"] = True
                    if privilege_level == 15:
                        data["has_privileged_plaintext_user"] = True
                    data["plaintext_account_names"].append(f"{username_str} (privilege {privilege_level})")
                    data["weak_password_policy"] = True
                elif "secret" in tokens:
                    s_idx = tokens.index("secret")
                    secret_args = tokens[s_idx + 1:]
                    if secret_args:
                        val = secret_args[1] if secret_args[0] in ["0", "5", "8", "9"] and len(secret_args) > 1 else secret_args[0]
                        if val in weak_passwords:
                            data["weak_password_policy"] = True

            # Enable Password (legacy / reversible / weak)
            if tokens[:2] == ["enable", "password"]:
                data["has_weak_enable_password"] = True
                data["weak_password_policy"] = True
            elif tokens[:2] == ["enable", "secret"]:
                secret_args = tokens[2:]
                if secret_args:
                    val = secret_args[1] if secret_args[0] in ["0", "5", "8", "9"] and len(secret_args) > 1 else secret_args[0]
                    if val in weak_passwords:
                        data["weak_password_policy"] = True

            # Line configuration passwords (e.g. password under line vty/console)
            if tokens[0] == "password" or "password 7" in line_l:
                data["weak_password_policy"] = True

            # Access Control Lists (ACL): Overly permissive rules
            if tokens[0] == "access-list" and len(tokens) > 2:
                rest_tokens = tokens[2:]
                if rest_tokens == ["permit", "any"] or (
                    len(rest_tokens) >= 3
                    and rest_tokens[:3] == ["permit", "ip", "any"]
                    and (len(rest_tokens) == 3 or rest_tokens[3] == "any")
                ):
                    data["overly_permissive_acl"] = True
                    data["permissive_acl_rules"].append(line)
            elif tokens[0] == "permit" and "any" in tokens:
                if tokens == ["permit", "any"] or tokens[:4] == ["permit", "ip", "any", "any"]:
                    data["overly_permissive_acl"] = True
                    data["permissive_acl_rules"].append(line)

            # Unnecessary Services
            if tokens[0] != "no":
                if (
                    tokens[:2] == ["service", "tcp-small-servers"]
                    or tokens[:2] == ["service", "udp-small-servers"]
                    or tokens[:3] == ["ip", "bootp", "server"]
                    or tokens[:1] == ["bootp-server"]
                    or tokens[:2] == ["ip", "finger"]
                    or tokens[:2] == ["service", "finger"]
                    or tokens[:3] == ["ip", "dns", "server"]
                    or tokens[:2] == ["ip", "source-route"]
                ):
                    other_unnecessary = True

        # Default weak password policy if min-length was never set
        if data.get("password_min_length") is None and not data.get("weak_password_policy"):
            data["weak_password_policy"] = True

        data["unnecessary_services"] = other_unnecessary or data["http_enabled"]

    # =========================================================
    # JUNIPER
    # =========================================================
    elif vendor == "Juniper":
        weak_passwords = {
            "12345", "123456", "1234", "juniper", "admin", "password",
            "root", "test", "juniper123", "admin123", "pass", "cisco"
        }
        other_unnecessary = False

        for raw_line in configuration.splitlines():
            line = raw_line.strip()
            if not line:
                continue

            # Ignore Junos comments
            if (
                line.startswith("#")
                or line.startswith("##")
                or line.startswith("/*")
                or line.startswith("*")
                or line.startswith("//")
                or line.startswith("!")
            ):
                continue

            line_clean = line.rstrip(";").strip()
            line_l = line_clean.lower()
            tokens = line_l.split()
            if not tokens:
                continue

            # -----------------------------------------------------
            # Hostname
            # -----------------------------------------------------
            if tokens[:3] == ["set", "system", "host-name"] and len(tokens) > 3:
                data["hostname"] = raw_line.split()[3].strip(';"')
            elif tokens[0] == "host-name" and len(tokens) > 1:
                data["hostname"] = raw_line.split()[1].strip(';"')

            # -----------------------------------------------------
            # Telnet
            # -----------------------------------------------------
            if tokens[:4] == ["set", "system", "services", "telnet"]:
                if "disable" in tokens[4:]:
                    data["telnet_enabled"] = False
                else:
                    data["telnet_enabled"] = True
            elif tokens[:4] in [
                ["delete", "system", "services", "telnet"],
                ["deactivate", "system", "services", "telnet"]
            ]:
                data["telnet_enabled"] = False
            elif tokens == ["telnet"]:
                data["telnet_enabled"] = True
            elif tokens == ["telnet", "disable"]:
                data["telnet_enabled"] = False

            # -----------------------------------------------------
            # SSH
            # -----------------------------------------------------
            if tokens[:4] == ["set", "system", "services", "ssh"]:
                if "disable" in tokens[4:]:
                    data["ssh_enabled"] = False
                else:
                    data["ssh_enabled"] = True

                # SSH protocol version check
                if "protocol-version" in tokens:
                    pv_idx = tokens.index("protocol-version")
                    if pv_idx + 1 < len(tokens):
                        pv_val = tokens[pv_idx + 1].strip(';"')
                        if pv_val in ["v1", "1"]:
                            data["ssh_v1_enabled"] = True
                        elif pv_val in ["v2", "2"]:
                            data["ssh_v1_enabled"] = False

                # Root login check
                if "root-login" in tokens:
                    rl_idx = tokens.index("root-login")
                    if rl_idx + 1 < len(tokens):
                        rl_val = tokens[rl_idx + 1].strip(';"')
                        if rl_val == "allow":
                            data["ssh_root_login_allowed"] = True
                        elif rl_val in ["deny", "unauthorized"]:
                            data["ssh_root_login_allowed"] = False

            elif tokens[:4] in [
                ["delete", "system", "services", "ssh"],
                ["deactivate", "system", "services", "ssh"]
            ]:
                data["ssh_enabled"] = False
            elif tokens == ["ssh"]:
                data["ssh_enabled"] = True
            elif tokens == ["ssh", "disable"]:
                data["ssh_enabled"] = False
            elif "protocol-version" in tokens:
                pv_idx = tokens.index("protocol-version")
                if pv_idx + 1 < len(tokens):
                    pv_val = tokens[pv_idx + 1].strip(';"')
                    if pv_val in ["v1", "1"]:
                        data["ssh_v1_enabled"] = True
                    elif pv_val in ["v2", "2"]:
                        data["ssh_v1_enabled"] = False
            elif "root-login" in tokens:
                rl_idx = tokens.index("root-login")
                if rl_idx + 1 < len(tokens):
                    rl_val = tokens[rl_idx + 1].strip(';"')
                    if rl_val == "allow":
                        data["ssh_root_login_allowed"] = True
                    elif rl_val in ["deny", "unauthorized"]:
                        data["ssh_root_login_allowed"] = False

            # -----------------------------------------------------
            # HTTP Management (Plain unencrypted HTTP)
            # -----------------------------------------------------
            if tokens[:5] == ["set", "system", "services", "web-management", "http"]:
                if "disable" in tokens[5:]:
                    data["http_enabled"] = False
                else:
                    data["http_enabled"] = True
            elif tokens[:5] in [
                ["delete", "system", "services", "web-management", "http"],
                ["deactivate", "system", "services", "web-management", "http"]
            ]:
                data["http_enabled"] = False
            elif tokens == ["http"] and "web-management" in line_l:
                data["http_enabled"] = True
            elif tokens == ["http", "disable"] and "web-management" in line_l:
                data["http_enabled"] = False

            # -----------------------------------------------------
            # Centralized Syslog / Logging
            # -----------------------------------------------------
            if tokens[:3] == ["set", "system", "syslog"]:
                if len(tokens) > 3 and tokens[3] in ["host", "server", "file", "console", "user"]:
                    data["logging_configured"] = True
            elif tokens[:3] in [
                ["delete", "system", "syslog"],
                ["deactivate", "system", "syslog"]
            ]:
                data["logging_configured"] = False
            elif tokens[0] in ["host", "file"] and len(tokens) > 1:
                data["logging_configured"] = True

            # -----------------------------------------------------
            # NTP
            # -----------------------------------------------------
            if tokens[:3] == ["set", "system", "ntp"]:
                if len(tokens) > 3 and tokens[3] in ["server", "peer", "boot-server"]:
                    data["ntp_configured"] = True
            elif tokens[:3] in [
                ["delete", "system", "ntp"],
                ["deactivate", "system", "ntp"]
            ]:
                data["ntp_configured"] = False
            elif tokens[0] in ["server", "peer"] and len(tokens) > 1:
                data["ntp_configured"] = True

            # -----------------------------------------------------
            # SNMP Public Community
            # -----------------------------------------------------
            if tokens[:4] == ["set", "snmp", "community", "public"]:
                if "authorization" in tokens:
                    auth_idx = tokens.index("authorization")
                    if auth_idx + 1 < len(tokens) and tokens[auth_idx + 1] == "none":
                        data["snmp_public"] = False
                    else:
                        data["snmp_public"] = True
                elif "disable" in tokens:
                    data["snmp_public"] = False
                else:
                    data["snmp_public"] = True
            elif tokens[:4] in [
                ["delete", "snmp", "community", "public"],
                ["deactivate", "snmp", "community", "public"]
            ]:
                data["snmp_public"] = False
            elif tokens[:2] == ["community", "public"]:
                data["snmp_public"] = True

            # -----------------------------------------------------
            # Centralized AAA (RADIUS / TACACS+)
            # -----------------------------------------------------
            if tokens[:3] == ["set", "system", "authentication-order"]:
                order_args = [t.strip(';[]",') for t in tokens[3:]]
                if any(proto in order_args for proto in ["radius", "tacplus"]):
                    data["aaa_configured"] = True
            elif tokens[:3] in [
                ["set", "system", "radius-server"],
                ["set", "system", "tacplus-server"]
            ]:
                data["aaa_configured"] = True
            elif tokens[:3] in [
                ["delete", "system", "authentication-order"],
                ["deactivate", "system", "authentication-order"]
            ]:
                data["aaa_configured"] = False
            elif tokens[0] == "authentication-order":
                if any(proto in tokens[1:] for proto in ["radius", "tacplus"]):
                    data["aaa_configured"] = True

            # -----------------------------------------------------
            # Login Protection (Retry Options / Lockout)
            # -----------------------------------------------------
            if tokens[:4] == ["set", "system", "login", "retry-options"]:
                if len(tokens) > 4 and tokens[4] in [
                    "tries-before-disconnect",
                    "backoff-threshold",
                    "lockout-period",
                    "backoff-factor"
                ]:
                    data["login_protection"] = True
            elif tokens[:4] in [
                ["delete", "system", "login", "retry-options"],
                ["deactivate", "system", "login", "retry-options"]
            ]:
                data["login_protection"] = False
            elif tokens[0] == "retry-options" or (
                tokens[0] in ["tries-before-disconnect", "backoff-threshold", "lockout-period"]
            ):
                data["login_protection"] = True

            # -----------------------------------------------------
            # Weak Password Policy & Plaintext Credentials
            # -----------------------------------------------------
            if "plain-text-password-value" in tokens:
                pt_idx = tokens.index("plain-text-password-value")
                if pt_idx + 1 < len(tokens):
                    pw = tokens[pt_idx + 1].strip(';"')
                    if pw in weak_passwords or len(pw) < 8:
                        data["weak_password_policy"] = True
                else:
                    data["weak_password_policy"] = True
            elif "plain-text-password" in tokens:
                data["weak_password_policy"] = True

            if "minimum-length" in tokens:
                ml_idx = tokens.index("minimum-length")
                if ml_idx + 1 < len(tokens):
                    try:
                        val = int(tokens[ml_idx + 1].strip(';"'))
                        if val < 8:
                            data["weak_password_policy"] = True
                    except ValueError:
                        pass

            # -----------------------------------------------------
            # Potentially Unnecessary / Insecure Services
            # -----------------------------------------------------
            if tokens[:3] == ["set", "system", "services"] and len(tokens) > 3:
                svc = tokens[3]
                if svc in ["finger", "ftp", "rlogin", "rsh", "xnm-clear-text"]:
                    if "disable" not in tokens:
                        other_unnecessary = True
            elif tokens[:4] in [
                ["delete", "system", "services", "finger"],
                ["delete", "system", "services", "ftp"],
                ["delete", "system", "services", "rlogin"],
                ["delete", "system", "services", "rsh"]
            ]:
                pass

        data["unnecessary_services"] = other_unnecessary or data["http_enabled"]

    # =========================================================
    # FORTINET
    # =========================================================
    elif vendor == "Fortinet":

        for line in configuration_lines:
            if line.lower().startswith("set hostname"):
                parts = line.split()
                if len(parts) > 2:
                    data["hostname"] = parts[2]

        if "telnet" in configuration_lower:
            data["telnet_enabled"] = True

        if "ssh" in configuration_lower:
            data["ssh_enabled"] = True

        if "http" in configuration_lower:
            data["http_enabled"] = True

        if "config log" in configuration_lower:
            data["logging_configured"] = True

        if "config system ntp" in configuration_lower:
            data["ntp_configured"] = True

        if "community public" in configuration_lower:
            data["snmp_public"] = True

    # =========================================================
    # PALO ALTO
    # =========================================================
    elif vendor == "Palo Alto":

        for line in configuration_lines:
            if "hostname" in line.lower():
                parts = line.split()
                if len(parts) > 1:
                    data["hostname"] = parts[-1]

        if "telnet" in configuration_lower:
            data["telnet_enabled"] = True

        if "ssh" in configuration_lower:
            data["ssh_enabled"] = True

        if "http" in configuration_lower:
            data["http_enabled"] = True

        if "syslog" in configuration_lower:
            data["logging_configured"] = True

        if "ntp" in configuration_lower:
            data["ntp_configured"] = True

        if "snmp" in configuration_lower and "public" in configuration_lower:
            data["snmp_public"] = True

    # =========================================================
    # HUAWEI
    # =========================================================
    elif vendor == "Huawei":

        for line in configuration_lines:
            if line.lower().startswith("sysname "):
                parts = line.split()
                if len(parts) > 1:
                    data["hostname"] = parts[1]

        if "telnet server enable" in configuration_lower:
            data["telnet_enabled"] = True

        if "stelnet server enable" in configuration_lower:
            data["ssh_enabled"] = True

        if "http" in configuration_lower:
            data["http_enabled"] = True

        if "info-center enable" in configuration_lower:
            data["logging_configured"] = True

        if "ntp-service" in configuration_lower:
            data["ntp_configured"] = True

        if "community public" in configuration_lower:
            data["snmp_public"] = True

    return data