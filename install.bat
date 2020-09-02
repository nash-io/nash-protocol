call rustc --version && cargo --version
call npm install --global neon-cli
call git clone "https://github.com/nash-io/public-mpc-wallet.git"
cd public-mpc-wallet
cd mpc-wallet-nodejs-win
call neon build --release