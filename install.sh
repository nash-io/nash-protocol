git clone "https://github.com/nash-io/public-mpc-wallet.git"
cd public-mpc-wallet

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
export PATH=$PATH:$HOME/.cargo/bin
rustc --version && cargo --version
npm install --global neon-cli
neon version

cd mpc-wallet-nodejs
neon build --release