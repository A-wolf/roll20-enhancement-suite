function addCategoryElemToCanvasTokenRightClickMenu(name, actionType, callback) {
    return [
        {
            includes: "/editor/",
            find: "<li class='head hasSub' data-action-type='addturn'>Add Turn</li>",
            patch: `<li class='head hasSub' data-action-type='addturn'>Add Turn</li>
<li class="head hasSub" data-menuname="${actionType}"> ${name} »
<ul class="submenu" id="${actionType}" data-menuname="${actionType}" style="width: auto;display: none;">

</ul>`,
        }
    ];
}


function addElemToCanvasTokenRightClickMenu(name, actionType, callback) {
    return [
        {
            includes: "/editor/",
            find: "<li class='head hasSub' data-action-type='addturn'>Add Turn</li>",
            patch: `<li class='head hasSub' data-action-type='addturn'>Add Turn</li>
<li class='head hasSub' data-action-type='${actionType}'>${name}</li>`,
        },

        {
            includes: "assets/app.js",
            find: `else if("toback"==e)`,
            patch: `else if("${actionType}"==e) window.r20es.${callback}(n), i(), d20.token_editor.removeRadialMenu();else if("toback"==e)`
        }
    ];
}

let hooks = {
    exposeD20: {
        
        force: true,

        includes: "assets/app.js",
        find: "var d20=d20||{};",
        patch: "var d20=d20||{};window.d20=d20;"
    },

    createFinalPageLoadEvent: {
        force: true,
        includes: "assets/app.js",

        find: `$("#loading-overlay").hide()`,
        patch: `$("#loading-overlay").hide();window.r20es.onAppLoad.fire(null);`
    },

    tokenLayerDrawing: {
        
        name: "Token layer drawing (GM Only)",
        description: "Draws an indicator at the bottom left of each token that indicates which layer it is on.",

        includes: "assets/app.js",
        find: "this.model.view.updateBackdrops(e),this.active",
        patch: "this.model.view.updateBackdrops(e), window.is_gm && window.r20es.tokenDrawBg(e, this), this.active"
    },

    activeLayerHud: {

        name: "Display active layer (GM Only)",
        description: "Displays the active edit layer as well as whether the select tool is active.",

        inject: ["draw_current_layer.js"],

        includes: "assets/app.js",
        find: "function setMode(e){",
        patch: "function setMode(e){if(window.r20es) window.r20es.setModePrologue(e);",
    },

    seenadOverride: {
        
        name: "Skip ad",
        description : "Skips loading ads",

        includes: "/editor/startjs/",
        find: "d20ext.showGoogleAd();",
        patch: 'window.d20ext.seenad = !0, $("#loading-overlay").find("div").hide(), window.currentPlayer && d20.Campaign.pages.length > 0 && d20.Campaign.handlePlayerPageChanges(), void $.get("/editor/startping/true");'
    },

    characterImportExport: {
        
        name: "Character Exporter/Importer",
        description : "Provides character importing (in the journal) and exporting (in the journal and on sheets).",

        inject: ["character_io.js"],
    },

    autoSelectNextToken: {
        
        name: "Select token on its turn",
        description : "Automatically selects a token on it's turn",

        includes: "assets/app.js",
        find: "e.push(t[0]);",
        patch: "e.push(t[0]);window.r20es.selectInitiativeToken(e[0]);"
    },

    autoFocusNextToken: {
        
        name: "Move camera to token on its turn",
        description : "Automatically moves the local camera to the token on it's turn. The camera movement is local only, meaning only your camera will move.",

        includes: "assets/app.js",
        find: "e.push(t[0]);",
        patch: "e.push(t[0]);window.r20es.moveCameraTo(e[0]);"
    },

    autoPingNextToken: {
        
        name: "Ping tokens visible to players on their turns",
        description : "Automatically pings a token on it's turn.",

        includes: "assets/app.js",
        find: "e.push(t[0]);",
        patch: "e.push(t[0]);window.r20es.pingInitiativeToken(e[0]);"
    },

    rollAndApplyHitDice: {
        
        name: "Roll and apply hit dice",
        description : `Adds a "Hit Dice" option to the token right click menu which rolls and applies hit dice for the selected tokens.`,

        mods: addElemToCanvasTokenRightClickMenu("Hit Dice", "r20es-hit-dice", "rollAndApplyHitDice"),

        configView: {
            diceFormulaAttribute: {
                display: "Hit dice formula attribute",
                type: "string",
            },
            bar: {
                display: "HP Bar",
                type: "dropdown",

                dropdownValues: {
                    bar1: "Bar 1",
                    bar2: "Bar 2",
                    bar3: "Bar 3"
                },
            }
        },

        config: {
            diceFormulaAttribute: "npc_hpformula",
            bar: "bar3",
        }
    },

    bulkMacros: {
     
        name: "Bulk macros",
        description : `Adds a "Bulk Macros" option to the token right click menu which lists macros that can be rolled for the whole selection in bulk.`,

        inject: ["bulk_macros.js"],
        mods: addCategoryElemToCanvasTokenRightClickMenu("Bulk Roll", "r20es-bulk-macro-menu", "handleBulkMacroMenuClick")
    },

    importExportTable: {
        
        name: "Table Import/export",
        description : "Provides rollable table importing and exporting. Supports TableExport format tables.",

        inject: ["import_export_table.js"],

        mods: [
            { // export buttons
                includes: "/editor/",
                find: "<button class='btn btn-danger deleterollabletable'>Delete Rollable Table</button>",
                patch: `<button class='btn r20es-table-export-json'>Export</button>
<button class='btn btn-danger deleterollabletable'>Delete Rollable Table</button>`
            },

            { // add table id to popup
                includes: "assets/app.js",
                find: `this.$el.on("click",".deleterollabletable"`,
                patch: `this.el.setAttribute("r20es-table-id", this.model.get("id")),this.$el.on("click",".deleterollabletable"`,                    
            }
        ]
    },

    duplicateInJournalContextMenu: {
        name: `"Duplicate" in journal context menu`,
        description: `Adds a "Duplicate" entry to the context menu of items found in the journal.`,

        mods: [
            {
                includes: "assets/app.js",
                find: `$("#journalitemmenu ul").on(mousedowntype,"li[data-action-type=showtoplayers]"`,
                patch: `$("#journalitemmenu ul").on(mousedowntype, "li[data-action-type=r20esduplicate]",() => {window.r20es.onJournalDuplicate($currentItemTarget.attr("data-itemid"))}),
$("#journalitemmenu ul").on(mousedowntype,"li[data-action-type=showtoplayers]"`
            }, 
            {
                includes: "/editor/",
                find: `<li data-action-type='archiveitem'>Archive Item</li>`,
                patch: `<li data-action-type='r20esduplicate'>Duplicate</li><li data-action-type='archiveitem'>Archive Item</li>`
            }
        ]
    },

    initiativeShortcuts: {
        name: "Initiative shortcuts",
        description: "Creates a shortcut for advancing (Ctrl+Right Arrow) in the initiative list.",

        inject: ["initiative_shortcuts.js"],
    },

    changeRepresentsIdWhenDuplicating: {
        name: `Reassign default token "Represents" when duplicating`,
        description : `This will make sure that if a character, who we want to duplicate, has default token, the character that he default token represents will be set to the duplicated character.`,

        includes: "assets/app.js",
        find: "o.defaulttoken=e.model._blobcache.defaulttoken",
        patch: `o.defaulttoken = window.r20es.replaceAll(e.model._blobcache.defaulttoken, e.model.get("id"), n.get("id"))`
    }
};

export { hooks };
