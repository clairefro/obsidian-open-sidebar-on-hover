/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
If you want to view the source, please visit the github repository of this plugin (https://github.com/AnAngryRaven/obsidian-open-sidebar-on-hover/)

Licenced under the MIT License
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => OpenSidebarHover
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  leftSidebar: true,
  rightSidebar: true,
  syncLeftRight: false,
  enforceSameDelay: true,
  sidebarDelay: 300,
  rightSideBarPixelTrigger: 30
};
var OpenSidebarHover = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.isHoveringLeft = false;
    this.isHoveringRight = false;
    // -- Non-Obsidian API --------------------------
    // Helpers
    this.getEditorWidth = () => this.app.workspace.containerEl.clientWidth;
    // Event handlers
    this.mouseMoveHandler = (event) => {
      if (this.settings.rightSidebar) {
        if (!this.isHoveringRight && this.rightSplit.collapsed) {
          const editorWidth = this.getEditorWidth();
          const mouseX = event.clientX;
          this.isHoveringRight = mouseX >= editorWidth - this.settings.rightSideBarPixelTrigger;
          if (this.isHoveringRight && this.rightSplit.collapsed) {
            if (this.settings.syncLeftRight) {
              this.expandBoth();
            } else {
              this.expandRight();
            }
          }
          setTimeout(() => {
            if (!this.isHoveringRight) {
              this.collapseRight();
            }
          }, this.settings.sidebarDelay);
        }
      }
    };
    this.rightSplitMouseLeaveHandler = () => {
      if (this.settings.rightSidebar) {
        this.isHoveringRight = false;
        setTimeout(() => {
          if (!this.isHoveringRight) {
            if (this.settings.syncLeftRight && this.settings.leftSidebar) {
              this.collapseBoth();
            } else {
              this.collapseRight();
            }
          }
        }, this.settings.sidebarDelay);
      }
    };
    this.leftSplitMouseLeaveHandler = () => {
      if (this.settings.leftSidebar) {
        this.isHoveringLeft = false;
        setTimeout(() => {
          if (!this.isHoveringLeft) {
            if (this.settings.syncLeftRight && this.settings.rightSidebar) {
              this.collapseBoth();
            } else {
              this.collapseLeft();
            }
          }
        }, this.settings.sidebarDelay);
      }
    };
    this.leftRibbonMouseEnterHandler = () => {
      if (this.settings.leftSidebar) {
        if (this.settings.syncLeftRight && this.settings.rightSidebar) {
          this.expandBoth();
        } else
          this.expandLeft();
      }
    };
  }
  async onload() {
    await this.loadSettings();
    console.log("settings", this.settings);
    this.app.workspace.onLayoutReady(() => {
      this.leftSplit = this.app.workspace.leftSplit;
      this.rightSplit = this.app.workspace.rightSplit;
      this.leftRibbon = this.app.workspace.leftRibbon;
      document.addEventListener("mousemove", this.mouseMoveHandler);
      this.rightSplit.containerEl.addEventListener(
        "mouseleave",
        this.rightSplitMouseLeaveHandler
      );
      this.leftRibbon.containerEl.addEventListener(
        "mouseenter",
        this.leftRibbonMouseEnterHandler
      );
      this.leftSplit.containerEl.addEventListener(
        "mouseleave",
        this.leftSplitMouseLeaveHandler
      );
    });
    this.addSettingTab(new SidebarHoverSettingsTab(this.app, this));
  }
  onunload() {
    this.saveSettings();
    document.removeEventListener("mousemove", this.mouseMoveHandler);
    this.rightSplit.containerEl.removeEventListener(
      "mouseleave",
      this.rightSplitMouseLeaveHandler
    );
    this.leftRibbon.containerEl.removeEventListener(
      "mouseenter",
      this.leftRibbonMouseEnterHandler
    );
    this.leftSplit.containerEl.addEventListener(
      "mouseleave",
      this.leftSplitMouseLeaveHandler
    );
  }
  async loadSettings() {
    this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  expandRight() {
    this.rightSplit.expand();
    this.isHoveringRight = true;
  }
  expandLeft() {
    this.leftSplit.expand();
    this.isHoveringLeft = true;
  }
  expandBoth() {
    this.expandRight();
    this.expandLeft();
  }
  collapseRight() {
    this.rightSplit.collapse();
    this.isHoveringRight = false;
  }
  collapseLeft() {
    this.leftSplit.collapse();
    this.isHoveringLeft = false;
  }
  collapseBoth() {
    this.collapseRight();
    this.collapseLeft();
  }
};
var SidebarHoverSettingsTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("Left Sidebar Hover").setDesc(
      "Enables the expansion and collapsing of the left sidebar on hover."
    ).addToggle(
      (t) => t.setValue(this.plugin.settings.leftSidebar).onChange(async (value) => {
        this.plugin.settings.leftSidebar = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Right Sidebar Hover").setDesc(
      "Enables the expansion and collapsing of the right sidebar on hover. Only collapses the right panel unless you have a right ribbon."
    ).addToggle(
      (t) => t.setValue(this.plugin.settings.rightSidebar).onChange(async (value) => {
        this.plugin.settings.rightSidebar = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Sync Left and Right").setDesc(
      "If enabled, hovering over the right sidebar will also expand the left sidebar at the same time, and vice versa. (Left and Right sidebar must both be enabled above)"
    ).addToggle(
      (t) => t.setValue(this.plugin.settings.syncLeftRight).onChange(async (value) => {
        this.plugin.settings.syncLeftRight = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Right Sidebar Pixel Trigger").setDesc(
      "Specify the number of pixels from the right edge of the editor that will trigger the right sidebar to open on hover (must be greater than 0)"
    ).addText((text) => {
      text.setPlaceholder("20").setValue(this.plugin.settings.rightSideBarPixelTrigger.toString()).onChange(async (value) => {
        const v = Number(value);
        if (!value || isNaN(v) || v < 1) {
          this.plugin.settings.rightSideBarPixelTrigger = DEFAULT_SETTINGS.rightSideBarPixelTrigger;
        } else {
          this.plugin.settings.rightSideBarPixelTrigger = v;
        }
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Collapse Delay").setHeading();
    new import_obsidian.Setting(containerEl).setName("Sidebar Collapse Delay").setDesc(
      "The delay in milliseconds before the sidebar collapses after the mouse has left. Enter '0' to disable delay."
    ).addText((text) => {
      text.setPlaceholder("300").setValue(this.plugin.settings.sidebarDelay.toString()).onChange(async (value) => {
        const v = Number(value);
        if (!v || isNaN(v) || v < 0) {
          this.plugin.settings.sidebarDelay = DEFAULT_SETTINGS.sidebarDelay;
        } else {
          this.plugin.settings.sidebarDelay = v;
        }
        await this.plugin.saveSettings();
      });
    });
  }
};