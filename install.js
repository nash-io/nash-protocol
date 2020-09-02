const os = require('os')
const child_process = require('child_process');

const exec = () => {
    const platform = os.platform()
    switch (platform) {
      case 'win32':
      case 'cygwin':
        return child_process.exec('call install.bat', function(error, stdout, stderr) {
            if (error) {
                console.error(stderr);
                process.exit(1)
                return
            }
            console.log(stdout);
        });
      case 'aix':
      case 'freebsd':
      case 'openbsd':
      case 'sunos':
      case 'netbsd':
      case 'linux':
      case 'darwin':
        return child_process.exec('./install.sh', function(error, stdout, stderr) {
            if (error) {
                console.error(stderr);
                process.exit(1)
                return
            }
            console.log(stdout);
        });
      default:
          throw new Error("Unsupported OS")
    }
  }

  exec()