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

![output 1]("C:\Users\soura\OneDrive\Desktop\CI-CD\o1.png")


