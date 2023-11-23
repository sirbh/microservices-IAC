## Ansible Exercise

### How to run

#### Generate the ssh keys

1. First generate the ssh key using `ssh-keygen -t rsa -b 2048`.
2. Choose the file name to save the key as `id_rsa`.
3. Leave the passphrase empty.
4. This will create 2 files id_rsa and id_rsa.pub.

#### Ansible container access

1. Maske sure you have docker installed and running.
2. Run `docker compose up -d`.
3. Now run `docker-compose exec knsach-ansible-control /bin/sh` to get terminal of ansible container

#### Running the playbook.yml

1. Now run `ansible-playbook -i knsach-service-one, playbook.yml` to run instruction on service. It may ask for fingerprint which be given `yes` as answere.
2. This give output similar to o1 below.
3. Now run `ansible-playbook -i knsach-service-one, playbook.yml` again to get output o2 with changes reduced to 2 since git with latest version is already installed.
4. Now run `ansible-playbook -i knsach-service-one,knsach-service-two, playbook.yml` to run instruction on both the services and get the output similar to o3 as shown below. It again ask for fingerprint which be given `yes` as answere.
5. Now again run the previous command to get the output with reduced number of changes for service-two.

### Outputs

#### Output 1(O1)

```console
PS C:\Users\soura\OneDrive\Desktop\CI-CD\ansible> docker-compose exec knsach-ansible-control /bin/sh
$ ansible-playbook -i knsach-service-one, playbook.yml
[WARNING]: While constructing a mapping from /ansible/playbook.yml, line 1, column 3, 
found a duplicate dict key (tasks). Using last defined value only.

PLAY [Configure Target Container] ****************************************************

TASK [Gathering Facts] ***************************************************************The authenticity of host 'knsach-service-one (172.30.0.4)' can't be established.      
ED25519 key fingerprint is SHA256:qZqEkDWqtZ9o7TaaVVJTwu578/1tGpLHtNoXB03UsnE.        
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
ok: [knsach-service-one]

TASK [Ensure latest git version is installed] ****************************************
changed: [knsach-service-one]

TASK [Check if Git is installed using git command] ***********************************
changed: [knsach-service-one]

TASK [Display Git installation status] ***********************************************
ok: [knsach-service-one] => {
    "git_check_result.stdout": "git version 2.34.1"
}

TASK [Run uptime] ********************************************************************
changed: [knsach-service-one]

TASK [Display Uptime Output] *********************************************************
ok: [knsach-service-one] => {
    "uptime_output.stdout_lines": [
        " 23:52:53 up 10:35,  0 users,  load average: 0.16, 0.16, 0.10"
    ]
}

PLAY RECAP ***************************************************************************
knsach-service-one         : ok=6    changed=3    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```
#### Output 2 (O2)

```console
$ ansible-playbook -i knsach-service-one, playbook.yml
[WARNING]: While constructing a mapping from /ansible/playbook.yml, line 1, column 3,
found a duplicate dict key (tasks). Using last defined value only.

PLAY [Configure Target Container] ****************************************************

TASK [Gathering Facts] ***************************************************************ok: [knsach-service-one]

TASK [Ensure latest git version is installed] ****************************************ok: [knsach-service-one]

TASK [Check if Git is installed using git command] ***********************************changed: [knsach-service-one]

TASK [Display Git installation status] ***********************************************ok: [knsach-service-one] => {
    "git_check_result.stdout": "git version 2.34.1"
}

TASK [Run uptime] ********************************************************************changed: [knsach-service-one]

TASK [Display Uptime Output] *********************************************************ok: [knsach-service-one] => {
    "uptime_output.stdout_lines": [
        " 23:54:33 up 10:37,  0 users,  load average: 0.03, 0.11, 0.09"
    ]
}

PLAY RECAP ***************************************************************************knsach-service-one         : ok=6    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

#### Output 3(O3)

```console
$ ansible-playbook -i knsach-service-one,knsach-service-two, playbook.yml
[WARNING]: While constructing a mapping from /ansible/playbook.yml, line 1, column 3,
found a duplicate dict key (tasks). Using last defined value only.

PLAY [Configure Target Container] ****************************************************

TASK [Gathering Facts] ***************************************************************
The authenticity of host 'knsach-service-two (172.30.0.3)' can't be established.
ED25519 key fingerprint is SHA256:qZqEkDWqtZ9o7TaaVVJTwu578/1tGpLHtNoXB03UsnE.        
This host key is known by the following other names/addresses:
    ~/.ssh/known_hosts:1: [hashed name]
Are you sure you want to continue connecting (yes/no/[fingerprint])? ok: [knsach-service-one]
yes
ok: [knsach-service-two]

TASK [Ensure latest git version is installed] ****************************************ok: [knsach-service-one]
changed: [knsach-service-two]

TASK [Check if Git is installed using git command] ***********************************

TASK [Display Git installation status] ***********************************************ok: [knsach-service-one] => {
    "git_check_result.stdout": "git version 2.34.1"
}
ok: [knsach-service-two] => {
    "git_check_result.stdout": "git version 2.34.1"
}

TASK [Run uptime] ********************************************************************changed: [knsach-service-one]
changed: [knsach-service-two]

TASK [Display Uptime Output] *********************************************************ok: [knsach-service-one] => {
    "uptime_output.stdout_lines": [
        " 23:59:09 up 10:42,  0 users,  load average: 0.28, 0.11, 0.09"
    ]
}
ok: [knsach-service-two] => {
    "uptime_output.stdout_lines": [
        " 23:59:09 up 10:42,  0 users,  load average: 0.28, 0.11, 0.09"
    ]
}

PLAY RECAP ***************************************************************************knsach-service-one         : ok=6    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
knsach-service-two         : ok=6    changed=3    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```
#### Output 4 (O4)

```console
$ ansible-playbook -i knsach-service-one,knsach-service-two, playbook.yml
[WARNING]: While constructing a mapping from /ansible/playbook.yml, line 1, column 3, found a duplicate dict key
(tasks). Using last defined value only.

PLAY [Configure Target Container] ********************************************************************************

TASK [Gathering Facts] *******************************************************************************************
ok: [knsach-service-one]
ok: [knsach-service-two]

TASK [Ensure latest git version is installed] ********************************************************************
ok: [knsach-service-one]
ok: [knsach-service-two]

TASK [Check if Git is installed using git command] ***************************************************************
changed: [knsach-service-two]
changed: [knsach-service-one]

TASK [Display Git installation status] ***************************************************************************
ok: [knsach-service-one] => {
    "git_check_result.stdout": "git version 2.34.1"
}
ok: [knsach-service-two] => {
    "git_check_result.stdout": "git version 2.34.1"
}

TASK [Run uptime] ************************************************************************************************
changed: [knsach-service-one]
changed: [knsach-service-two]

TASK [Display Uptime Output] *************************************************************************************
ok: [knsach-service-one] => {
    "uptime_output.stdout_lines": [
        " 00:30:33 up 11:13,  0 users,  load average: 0.08, 0.02, 0.01"
    ]
}
ok: [knsach-service-two] => {
    "uptime_output.stdout_lines": [
        " 00:30:34 up 11:13,  0 users,  load average: 0.08, 0.02, 0.01"
    ]
}

PLAY RECAP *******************************************************************************************************
knsach-service-one         : ok=6    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0

knsach-service-two         : ok=6    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

