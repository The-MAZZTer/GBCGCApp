I am porting this project to a Chrome app.  It will be able to run in the browser without an active internet connection.

GB/GBC icons: http://starvingartist.deviantart.com/art/Antiseptic-Videogame-Systems-23217105
Other icons: http://www.famfamfam.com/lab/icons/silk/

Borrowed some old Chrome NTP code to make i18n stuff in HTML easier (see source for details).

TODO:
- Look into registering this App as a handler for .gb/.gbc files on Chrome OS.
	- Seems to sort of work, need to test a little more.
- Add keybindings to simulate tilt. (Support doesn't seem finished yet in the emulator.)
	- Simulating with mouse/gamepad will probably be better.
- Add support for gamepad input. (API seems broken in Chrome)
- Try to get it running at an acceptable speed on a Cr48.

Original README follows.

JavaScript GameBoy Color Emulator
=================================

**Copyright (C) 2010 - 2012 Grant Galitz**

A GameBoy Color emulator that utilizes HTML5 canvas and JavaScript audio APIs to provide a full emulation of the console.

**License:**

*This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
version 2 as published by the Free Software Foundation.
The full license is available at http://www.gnu.org/licenses/gpl.html
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.*

Known browsers to work well in:
-------------------------------

* Firefox 4+ (Windows 7, Windows Vista, Mac OS X)
* Google Chrome 18+
* Safari 5.1.5+

Browsers that suck at performance or fail to run the code correctly:
--------------------------------------------------------------------

* Firefox 4+ (Linux + Windows XP versions of Firefox have audio lockup bugs)
* Opera (Crashes + Slow + Graphics Glitches)
* Safari 5.1.X (Below 5.1.5) (Slow or crashes)
* IE 1-8 (Cannot run)
* IE 9-10 (Slow)
* Firefox 1-3.6 (Slow)
* ALL VERSIONS OF MOBILE SAFARI AND OPERA (Stop pestering me, iOS just **CAN'T** run this well.)

CPU instruction set accuracy test results (Blargg's cpu_instrs.gb test ROM):
-----------------------------------------------------

* **GameBoy Online:**

	![GameBoy Online (This emulator)](http://i.imgur.com/ivs7F.png "Passes")
* **Visual Boy Advance 1.7.2:**
	
	![Visual Boy Advance 1.7.2](http://i.imgur.com/NYnYu.png "Fails")
* **KiGB:**

	![KiGB](http://i.imgur.com/eYHDH.png "Fails")
* **Gambatte:**

	![Gambatte](http://i.imgur.com/vGHFz.png "Passes")
