#!/bin/bash
ssh -l root 14.225.204.150 -o StrictHostKeyChecking=no "curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash"
