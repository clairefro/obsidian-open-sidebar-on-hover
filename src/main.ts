import { App, Plugin, PluginSettingTab, Setting } from "obsidian";

interface OpenSidebarHoverSettings {
  leftSidebar: boolean;
  rightSidebar: boolean;
  syncLeftRight: boolean;
  enforceSameDelay: boolean;
  sidebarDelay: number;
  rightSideBarPixelTrigger: number;
}

const DEFAULT_SETTINGS: OpenSidebarHoverSettings = {
  leftSidebar: true,
  rightSidebar: true,
  syncLeftRight: false,
  enforceSameDelay: true,
  sidebarDelay: 300,
  rightSideBarPixelTrigger: 30,
};

export default class OpenSidebarHover extends Plugin {
  settings: OpenSidebarHoverSettings;
  isHoveringLeft = false;
  isHoveringRight = false;
  leftSplit: any;
  rightSplit: any;
  leftRibbon: any;

  async onload() {
    await this.loadSettings();

    console.log("settings", this.settings);
    this.app.workspace.onLayoutReady(() => {
      this.leftSplit = this.app.workspace.leftSplit;
      this.rightSplit = this.app.workspace.rightSplit;

      this.leftRibbon = this.app.workspace.leftRibbon;

      // add event listeners - IMPORTANT: REMOVE IN UNLOAD()
      document.addEventListener("mousemove", this.mouseMoveHandler);
      this.rightSplit.containerEl.addEventListener(
        "mouseleave",
        this.rightSplitMouseLeaveHandler
      );
      (this.leftRibbon as any).containerEl.addEventListener(
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

    // remove all event listeners
    document.removeEventListener("mousemove", this.mouseMoveHandler);
    this.rightSplit.containerEl.removeEventListener(
      "mouseleave",
      this.rightSplitMouseLeaveHandler
    );
    (this.leftRibbon as any).containerEl.removeEventListener(
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

  // -- Non-Obsidian API --------------------------
  // Helpers
  getEditorWidth = () => this.app.workspace.containerEl.clientWidth;

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
  // Event handlers
  mouseMoveHandler = (event) => {
    if (this.settings.rightSidebar) {
      if (!this.isHoveringRight && this.rightSplit.collapsed) {
        const editorWidth = this.getEditorWidth();
        const mouseX = event.clientX;

        this.isHoveringRight =
          mouseX >= editorWidth - this.settings.rightSideBarPixelTrigger;

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

  rightSplitMouseLeaveHandler = () => {
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

  leftSplitMouseLeaveHandler = () => {
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

  leftRibbonMouseEnterHandler = () => {
    if (this.settings.leftSidebar) {
      if (this.settings.syncLeftRight && this.settings.rightSidebar) {
        this.expandBoth();
      } else this.expandLeft();
    }
  };
}

class SidebarHoverSettingsTab extends PluginSettingTab {
  plugin: OpenSidebarHover;

  constructor(app: App, plugin: OpenSidebarHover) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Left Sidebar Hover")
      .setDesc(
        "Enables the expansion and collapsing of the left sidebar on hover."
      )
      .addToggle((t) =>
        t.setValue(this.plugin.settings.leftSidebar).onChange(async (value) => {
          this.plugin.settings.leftSidebar = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Right Sidebar Hover")
      .setDesc(
        "Enables the expansion and collapsing of the right sidebar on hover. Only collapses the right panel unless you have a right ribbon."
      )
      .addToggle((t) =>
        t
          .setValue(this.plugin.settings.rightSidebar)
          .onChange(async (value) => {
            this.plugin.settings.rightSidebar = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Sync Left and Right")
      .setDesc(
        "If enabled, hovering over the right sidebar will also expand the left sidebar at the same time, and vice versa. (Left and Right sidebar must both be enabled above)"
      )
      .addToggle((t) =>
        t
          .setValue(this.plugin.settings.syncLeftRight)
          .onChange(async (value) => {
            this.plugin.settings.syncLeftRight = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Right Sidebar Pixel Trigger")
      .setDesc(
        "Specify the number of pixels from the right edge of the editor that will trigger the right sidebar to open on hover (must be greater than 0)"
      )
      .addText((text) => {
        text
          .setPlaceholder("20")
          .setValue(this.plugin.settings.rightSideBarPixelTrigger.toString())
          .onChange(async (value) => {
            const v = Number(value);
            if (!value || isNaN(v) || v < 1) {
              this.plugin.settings.rightSideBarPixelTrigger =
                DEFAULT_SETTINGS.rightSideBarPixelTrigger;
            } else {
              this.plugin.settings.rightSideBarPixelTrigger = v;
            }
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl).setName("Collapse Delay").setHeading();

    new Setting(containerEl)
      .setName("Sidebar Collapse Delay")
      .setDesc(
        "The delay in milliseconds before the sidebar collapses after the mouse has left. Enter '0' to disable delay."
      )
      .addText((text) => {
        text
          .setPlaceholder("300")

          .setValue(this.plugin.settings.sidebarDelay.toString())

          .onChange(async (value) => {
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
}
