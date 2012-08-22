I am porting this project to a Chrome app.  It will be able to run in the browser without an active internet connection.

Favicon: http://starvingartist.deviantart.com/art/Antiseptic-Videogame-Systems-23217105
Other icons: http://www.famfamfam.com/lab/icons/silk/

Borrowed some old Chrome NTP code to make i18n stuff in HTML easier (see source for details).

TODO:
- Streamline UI.
  - Move settings into dedicated Options page
  - Remove confirm()s, replace with a real UI
  - Move Instructions and About into some sort of Help menu or remove entirely
  - Make UI for managing save states/freezes a bit nicer
- Hook up Toolbar functionality
	- Slot Select (drop down)
	- Options
	- Manage Saves (Import/Export/Copy/Delete)
- Figure out why canvas is getting width and height tags and look into removing them.
	- Remove visibility style being set by emulator.
	- Look into all styles being set.
- Add option to have canvas scaling only scale in increments of 100%
	- Or scale to fit.
	- Preserve aspect ratio toggle.
- Remove JS scaling option?  (Might not work as-is with my new scaling methods, will have to look into it.)
- Auto save a freeze snapshot on unload or rom unload.  Auto load this when resuming (like the 3DS does).
	- unload and loadROM need to save, loadROM to load
- Use a different api other than LocalStorage to store saves/freezes as it is capped at 5MB.  Web database seems to explicitly be supported by the unlimtiedStorage permission, should also test the persistant filesystem API?
	- GameBoyIO appears to call several functions that use LocalStorage, I'll probably want to replicate that API.
- Allow custom key binds.
- Look into registering this App as a handler for .gb/.gbc files on Chrome OS.
	- Different default fullscreen key bind to reflect Chrome OS keyboard layout.
- Option to mute/pause game on page unfocus.
- Add support for gamepad input.
- When selecting different save states, gray out load if the state does not exist.  Use different icon for states that don't exist.
- See what device orientation handlers do.  My scaling will probably have to take them into account.

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
