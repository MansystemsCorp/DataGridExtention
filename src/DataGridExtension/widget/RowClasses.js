//----------------------------------------------------------------------
// Dynamic Row Classes
//----------------------------------------------------------------------
define(["dojo/_base/declare", "dojo/aspect", "dojo/dom-class", "dojo/dom-attr"], function(declare, aspect, domClass, domAttr) {
    "user strict";
    return declare(null, {
        mixins: [mxui.mixin._Contextable],

        rowClassTable: [],

        inputargs: {
            rowClassMapping: [],
            rowClassAttr: ""
        },

        checkConfigRowClasses: function() {
            if (this.rowClassMapping.length > 0 && !this.rowClassAttr)
                this.showError("Row Class mapping needs an entity and attribute.");
            // dataGridEntity is only required to for the widget to select an attribute of the context.
            // So we  need to check that they are of the same type.
            if (this.dataGridEntity && this.dataGridEntity !== this.grid.entity)
                this.showError("The Row Grid Entity should be the same as the grid.");
        },

        postCreateRowClasses: function() {
            this.checkConfigRowClasses();

            this.rowClassTable = [];

            if (this.rowClassAttr.length > 0) {
                this.setupDynamicRowClasses();
            }
            this.loaded();
        },

        setupDynamicRowClasses: function() {

            if (this.rowClassAttr) {
                var self = this; // needed in aspect function

                this.grid.rowClassMapping = {};
                for (var i = 0; i < this.rowClassMapping.length; i++) {
                    this.rowClassTable[this.rowClassMapping[i].key] = this.rowClassMapping[i].value;
                }
                aspect.around(this.grid, "_gridbodyFillRow", function(originalMethod) {
                    // wrap around the grid function to change stuff before and after.
                    return function(mxobj, gridMatrixRow, gridAttributes) {
                        if (mxobj.has(self.rowClassAttr)) { // check Has Attribute
                            var tr = gridMatrixRow[0].parentNode,
                                value = mxobj.get(self.rowClassAttr);
                            if (value in self.rowClassTable) {
                                value = self.rowClassTable[value];
                            } else {
                                value = value.toString().replace(/[^\w_-]/gi, ''); // remove all special characters, TODO: remove leading digits too.
                            }
                            // first remove previous class
                            var customRowClass = domAttr.get(tr, "customRowClass", value);
                            domClass.remove(tr, customRowClass);
                            // now add the new class and save it for the next change
                            domClass.add(tr, value);
                            domAttr.set(tr, "customRowClass", value);
                        }
                        originalMethod.apply(this, arguments);
                    };
                });
            }
        }

    });
});

//@ sourceURL=widgets/DataGridExtension/widget/RowClasses.js
