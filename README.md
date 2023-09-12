# hmsight
hmsight is a website for displaying the temperature of CPUs, GPUs, and other devices. Temperature data is obtained via the Remote Web Server of [Libre Hardware Monitor](https://github.com/LibreHardwareMonitor/LibreHardwareMonitor) running on a PC.

## How to use
1. Install [Libre Hardware Monitor](https://github.com/LibreHardwareMonitor/LibreHardwareMonitor) on the PC you wish to monitor temperatures.
1. Run Libre Hardware Monitor and check "Options -> Remote Web Server -> Run".
1. Check the server URL (e.g. http://192.168.86.31:8085) under "Options -> Remote Web Server -> Port".
1. Access [GitHub Pages](https://ricmsd.github.io/hmsight/) in a browser or clone this repository and open index.html.
1. When the Preference dialog appears, enter the URL you just entered in the "Web Server URL" field.
1. Close the dialog and monitoring will start. (Of course, the port for the URL you entered must be free.)

