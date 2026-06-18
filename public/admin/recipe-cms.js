(function () {
  var createElement = window.React.createElement;
  var h = createElement;
  var Component = window.React.Component;

  function fetchFixedUnits() {
    return fetch("/api/units")
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        return data.fixedUnits || [];
      })
      .catch(function () {
        return [];
      });
  }

  var QUICK_PICK_UNITS = ["tsp", "tbsp", "cup", "g", "oz", "ml"];

  function fieldLabel(text) {
    return h("span", { className: "recipe-field-label" }, text);
  }

  function parseNotesMarkdown(markdown) {
    var trimmed = (markdown || "").trim();
    if (!trimmed) return [];

    return trimmed.split(/\n\n+/).map(function (chunk) {
      var lines = chunk.split("\n");
      var firstLine = lines[0] || "";

      if (/^###\s+/.test(firstLine) && lines.length === 1) {
        return { type: "section", text: firstLine.replace(/^###\s+/, "") };
      }

      if (/^##\s+/.test(firstLine) && lines.length === 1) {
        return { type: "header", text: firstLine.replace(/^##\s+/, "") };
      }

      return { type: "paragraph", text: chunk };
    });
  }

  function serializeNotesMarkdown(blocks) {
    return blocks
      .filter(function (block) {
        return block.text && block.text.trim();
      })
      .map(function (block) {
        if (block.type === "header") return "## " + block.text.trim();
        if (block.type === "section") return "### " + block.text.trim();
        return block.text.trim();
      })
      .join("\n\n")
      .trim();
  }

  var RecipeUnitControl = (function (Super) {
    function RecipeUnitControl(props) {
      Super.call(this, props);
      this.state = { fixedUnits: [], loading: true };
    }

    if (Super) RecipeUnitControl.__proto__ = Super;
    RecipeUnitControl.prototype = Object.create(Super && Super.prototype);
    RecipeUnitControl.prototype.constructor = RecipeUnitControl;

    RecipeUnitControl.prototype.componentDidMount = function () {
      var self = this;
      fetchFixedUnits().then(function (fixedUnits) {
        self.setState({ fixedUnits: fixedUnits, loading: false });
      });
    };

    RecipeUnitControl.prototype.render = function () {
      var value = this.props.value || "";
      var fixedUnits = this.state.fixedUnits;
      var self = this;
      var listId = "recipe-unit-list-" + self.props.forID;
      var quickPicks = QUICK_PICK_UNITS.filter(function (unit) {
        return fixedUnits.length === 0 || fixedUnits.indexOf(unit) !== -1;
      });

      return h(
        "div",
        null,
        h("input", {
          type: "text",
          list: listId,
          className: "recipe-input",
          id: self.props.forID,
          value: value,
          placeholder: "tsp, cup, g…",
          onChange: function (event) {
            self.props.onChange(event.target.value);
          },
          onBlur: function (event) {
            self.props.onChange(event.target.value.trim().toLowerCase());
          },
        }),
        h(
          "datalist",
          { id: listId },
          fixedUnits.map(function (unit) {
            return h("option", { key: unit, value: unit });
          })
        ),
        quickPicks.length
          ? h(
              "div",
              { className: "recipe-unit-chips" },
              quickPicks.map(function (unit) {
                var selected = value.trim().toLowerCase() === unit;
                return h(
                  "button",
                  {
                    key: unit,
                    type: "button",
                    className: "recipe-unit-chip" + (selected ? " is-selected" : ""),
                    onClick: function () {
                      self.props.onChange(unit);
                    },
                  },
                  unit
                );
              })
            )
          : null
      );
    };

    return RecipeUnitControl;
  })(Component);

  var RecipeIngredientControl = (function (Super) {
    function RecipeIngredientControl(props) {
      Super.call(this, props);
      this.state = { fixedUnits: [] };
    }

    if (Super) RecipeIngredientControl.__proto__ = Super;
    RecipeIngredientControl.prototype = Object.create(Super && Super.prototype);
    RecipeIngredientControl.prototype.constructor = RecipeIngredientControl;

    RecipeIngredientControl.prototype.componentDidMount = function () {
      var self = this;
      fetchFixedUnits().then(function (fixedUnits) {
        self.setState({ fixedUnits: fixedUnits });
      });
    };

    RecipeIngredientControl.prototype.render = function () {
      var self = this;
      var value = this.props.value || { amount: "", unit: "", item: "" };
      var fixedUnits = this.state.fixedUnits;
      var listId = "recipe-ingredient-unit-" + this.props.forID;

      function update(patch) {
        self.props.onChange(Object.assign({}, value, patch));
      }

      return h(
        "div",
        { className: "recipe-card" },
        h(
          "div",
          { className: "recipe-ingredient-grid" },
          h(
            "div",
            null,
            fieldLabel("Amount"),
            h("input", {
              className: "recipe-input",
              value: value.amount || "",
              placeholder: "2",
              onChange: function (event) {
                update({ amount: event.target.value });
              },
            })
          ),
          h(
            "div",
            null,
            fieldLabel("Unit"),
            h("input", {
              type: "text",
              list: listId,
              className: "recipe-input",
              value: value.unit || "",
              placeholder: "tsp, cup, g…",
              onChange: function (event) {
                update({ unit: event.target.value });
              },
              onBlur: function (event) {
                update({ unit: event.target.value.trim().toLowerCase() });
              },
            }),
            h(
              "datalist",
              { id: listId },
              fixedUnits.map(function (unit) {
                return h("option", { key: unit, value: unit });
              })
            )
          ),
          h(
            "div",
            null,
            fieldLabel("Ingredient"),
            h("input", {
              className: "recipe-input",
              value: value.item || "",
              placeholder: "unsalted butter",
              onChange: function (event) {
                update({ item: event.target.value });
              },
            })
          )
        )
      );
    };

    return RecipeIngredientControl;
  })(Component);

  var RecipeSectionControl = (function (Super) {
    function RecipeSectionControl(props) {
      Super.call(this, props);
    }

    if (Super) RecipeSectionControl.__proto__ = Super;
    RecipeSectionControl.prototype = Object.create(Super && Super.prototype);
    RecipeSectionControl.prototype.constructor = RecipeSectionControl;

    RecipeSectionControl.prototype.render = function () {
      var self = this;
      var value = this.props.value || {};
      var label = value.label || "";

      return h(
        "div",
        { className: "recipe-section-divider" },
        h("span", { className: "recipe-section-line", "aria-hidden": true }),
        h("input", {
          className: "recipe-section-input",
          value: label,
          placeholder: "Section name",
          onChange: function (event) {
            self.props.onChange({ type: "section", label: event.target.value });
          },
        }),
        h("span", { className: "recipe-section-line", "aria-hidden": true })
      );
    };

    return RecipeSectionControl;
  })(Component);

  var RecipeStepControl = (function (Super) {
    function RecipeStepControl(props) {
      Super.call(this, props);
    }

    if (Super) RecipeStepControl.__proto__ = Super;
    RecipeStepControl.prototype = Object.create(Super && Super.prototype);
    RecipeStepControl.prototype.constructor = RecipeStepControl;

    RecipeStepControl.prototype.render = function () {
      var self = this;
      var raw = this.props.value;
      var text =
        typeof raw === "string"
          ? raw
          : raw && (raw.text || raw.step)
            ? raw.text || raw.step
            : "";

      return h(
        "div",
        { className: "recipe-card" },
        fieldLabel("Step"),
        h("textarea", {
          className: "recipe-textarea",
          value: text,
          placeholder: "Describe what happens in this step…",
          onChange: function (event) {
            self.props.onChange(event.target.value);
          },
        })
      );
    };

    return RecipeStepControl;
  })(Component);

  var RecipeNotesControl = (function (Super) {
    function RecipeNotesControl(props) {
      Super.call(this, props);
      this.state = {
        blocks: parseNotesMarkdown(props.value || ""),
      };
    }

    if (Super) RecipeNotesControl.__proto__ = Super;
    RecipeNotesControl.prototype = Object.create(Super && Super.prototype);
    RecipeNotesControl.prototype.constructor = RecipeNotesControl;

    RecipeNotesControl.prototype.componentDidUpdate = function (prevProps) {
      if (prevProps.value !== this.props.value && this.props.value !== serializeNotesMarkdown(this.state.blocks)) {
        this.setState({ blocks: parseNotesMarkdown(this.props.value || "") });
      }
    };

    RecipeNotesControl.prototype.updateBlocks = function (blocks) {
      this.setState({ blocks: blocks });
      this.props.onChange(serializeNotesMarkdown(blocks));
    };

    RecipeNotesControl.prototype.render = function () {
      var self = this;
      var blocks = this.state.blocks;

      function updateBlock(index, nextBlock) {
        var next = blocks.slice();
        next[index] = nextBlock;
        self.updateBlocks(next);
      }

      function removeBlock(index) {
        self.updateBlocks(blocks.filter(function (_, blockIndex) {
          return blockIndex !== index;
        }));
      }

      function addBlock(block) {
        self.updateBlocks(blocks.concat([block]));
      }

      return h(
        "div",
        { className: "recipe-notes-editor" },
        blocks.length === 0
          ? h("p", { className: "recipe-notes-empty" }, "No notes yet. Add a block below.")
          : blocks.map(function (block, index) {
              if (block.type === "header") {
                return h(
                  "div",
                  { key: index, className: "recipe-notes-block" },
                  h("input", {
                    className: "recipe-header-input",
                    value: block.text,
                    placeholder: "Section title",
                    onChange: function (event) {
                      updateBlock(index, { type: "header", text: event.target.value });
                    },
                  })
                );
              }

              if (block.type === "section") {
                return h(
                  "div",
                  { key: index, className: "recipe-notes-block recipe-section-divider" },
                  h("span", { className: "recipe-section-line", "aria-hidden": true }),
                  h("input", {
                    className: "recipe-section-input",
                    value: block.text,
                    placeholder: "Section name",
                    onChange: function (event) {
                      updateBlock(index, { type: "section", text: event.target.value });
                    },
                  }),
                  h("span", { className: "recipe-section-line", "aria-hidden": true })
                );
              }

              return h(
                "div",
                { key: index, className: "recipe-notes-block recipe-card" },
                h("textarea", {
                  className: "recipe-textarea",
                  value: block.text,
                  placeholder: "Share tips, substitutions, or context…",
                  onChange: function (event) {
                    updateBlock(index, { type: "paragraph", text: event.target.value });
                  },
                })
              );
            }),
        h(
          "div",
          { className: "recipe-notes-toolbar" },
          h(
            "button",
            {
              type: "button",
              className: "recipe-notes-btn",
              onClick: function () {
                addBlock({ type: "paragraph", text: "" });
              },
            },
            "+ Paragraph"
          ),
          h(
            "button",
            {
              type: "button",
              className: "recipe-notes-btn",
              onClick: function () {
                addBlock({ type: "header", text: "" });
              },
            },
            "+ Header"
          ),
          h(
            "button",
            {
              type: "button",
              className: "recipe-notes-btn",
              onClick: function () {
                addBlock({ type: "section", text: "" });
              },
            },
            "+ Section"
          )
        )
      );
    };

    return RecipeNotesControl;
  })(Component);

  function parseRecipeTime(value) {
    var normalized = (value || "").trim().toLowerCase();
    if (!normalized) return { hours: "", minutes: "" };

    var hourMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/);
    var minMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)\b/);
    var hours = hourMatch ? parseFloat(hourMatch[1]) : 0;
    var minutes = minMatch ? parseFloat(minMatch[1]) : 0;

    if (!hourMatch && !minMatch) {
      var onlyNumber = normalized.match(/^(\d+(?:\.\d+)?)$/);
      if (onlyNumber) return { hours: "", minutes: onlyNumber[1] };
      return { hours: "", minutes: "" };
    }

    return {
      hours: hours > 0 ? String(hours) : "",
      minutes: minutes > 0 ? String(minutes) : "",
    };
  }

  function formatRecipeTime(parts) {
    var hours = parseFloat(parts.hours);
    var minutes = parseFloat(parts.minutes);
    var hasHours = parts.hours && !isNaN(hours) && hours > 0;
    var hasMinutes = parts.minutes && !isNaN(minutes) && minutes > 0;

    if (hasHours && hasMinutes) return hours + " hr " + minutes + " min";
    if (hasHours) return hours + " hr";
    if (hasMinutes) return minutes + " min";
    return "";
  }

  var RecipeTimeControl = (function (Super) {
    function RecipeTimeControl(props) {
      Super.call(this, props);
    }

    if (Super) RecipeTimeControl.__proto__ = Super;
    RecipeTimeControl.prototype = Object.create(Super && Super.prototype);
    RecipeTimeControl.prototype.constructor = RecipeTimeControl;

    RecipeTimeControl.prototype.render = function () {
      var self = this;
      var parts = parseRecipeTime(this.props.value || "");

      function update(patch) {
        var next = { hours: parts.hours, minutes: parts.minutes };
        for (var key in patch) next[key] = patch[key];
        self.props.onChange(formatRecipeTime(next));
      }

      return h(
        "div",
        { className: "recipe-time-row" },
        h("input", {
          type: "number",
          min: 0,
          className: "recipe-input recipe-time-input",
          id: self.props.forID,
          value: parts.hours,
          placeholder: "0",
          onChange: function (event) {
            update({ hours: event.target.value });
          },
        }),
        h("span", { className: "recipe-time-suffix" }, "hr"),
        h("input", {
          type: "number",
          min: 0,
          max: 59,
          className: "recipe-input recipe-time-input",
          value: parts.minutes,
          placeholder: "0",
          onChange: function (event) {
            update({ minutes: event.target.value });
          },
        }),
        h("span", { className: "recipe-time-suffix" }, "min")
      );
    };

    return RecipeTimeControl;
  })(Component);

  function isIngredientSectionItem(item) {
    return (
      item &&
      typeof item === "object" &&
      (item.type === "section" || item.type === "subheader")
    );
  }

  function normalizeIngredientItem(item) {
    if (isIngredientSectionItem(item)) {
      return { type: "section", label: item.label || "" };
    }

    if (item && typeof item === "object") {
      return {
        amount: String(item.amount || ""),
        unit: String(item.unit || ""),
        item: String(item.item || ""),
      };
    }

    return { amount: "", unit: "", item: "" };
  }

  function isStepSectionItem(item) {
    return (
      item &&
      typeof item === "object" &&
      (item.type === "section" || item.type === "subheader")
    );
  }

  function normalizeStepItem(item) {
    if (typeof item === "string") {
      return item;
    }

    if (isStepSectionItem(item)) {
      return { type: "section", label: item.label || "" };
    }

    if (item && typeof item === "object") {
      return String(item.text || item.step || "");
    }

    return "";
  }

  function listRemoveButton(onRemove) {
    return h(
      "button",
      {
        type: "button",
        className: "recipe-list-remove",
        onClick: onRemove,
      },
      "Remove"
    );
  }

  var RecipeIngredientsListControl = (function (Super) {
    function RecipeIngredientsListControl(props) {
      Super.call(this, props);
    }

    if (Super) RecipeIngredientsListControl.__proto__ = Super;
    RecipeIngredientsListControl.prototype = Object.create(
      Super && Super.prototype
    );
    RecipeIngredientsListControl.prototype.constructor =
      RecipeIngredientsListControl;

    RecipeIngredientsListControl.prototype.render = function () {
      var self = this;
      var items = Array.isArray(this.props.value)
        ? this.props.value.map(normalizeIngredientItem)
        : [];

      function updateItems(next) {
        self.props.onChange(next);
      }

      function updateAt(index, value) {
        var next = items.slice();
        next[index] = value;
        updateItems(next);
      }

      function removeAt(index) {
        updateItems(
          items.filter(function (_, itemIndex) {
            return itemIndex !== index;
          })
        );
      }

      return h(
        "div",
        { className: "recipe-list-editor" },
        items.length === 0
          ? h("p", { className: "recipe-notes-empty" }, "No ingredients yet.")
          : items.map(function (item, index) {
              if (isIngredientSectionItem(item)) {
                return h(
                  "div",
                  { key: index, className: "recipe-list-item" },
                  h(RecipeSectionControl, {
                    value: item,
                    forID: self.props.forID + "-ing-" + index,
                    onChange: function (value) {
                      updateAt(index, value);
                    },
                  }),
                  listRemoveButton(function () {
                    removeAt(index);
                  })
                );
              }

              return h(
                "div",
                { key: index, className: "recipe-list-item" },
                h(RecipeIngredientControl, {
                  value: item,
                  forID: self.props.forID + "-ing-" + index,
                  onChange: function (value) {
                    updateAt(index, value);
                  },
                }),
                listRemoveButton(function () {
                  removeAt(index);
                })
              );
            }),
        h(
          "div",
          { className: "recipe-notes-toolbar" },
          h(
            "button",
            {
              type: "button",
              className: "recipe-notes-btn",
              onClick: function () {
                updateItems(
                  items.concat([{ amount: "", unit: "", item: "" }])
                );
              },
            },
            "+ Ingredient"
          ),
          h(
            "button",
            {
              type: "button",
              className: "recipe-notes-btn",
              onClick: function () {
                updateItems(
                  items.concat([{ type: "section", label: "" }])
                );
              },
            },
            "+ Section"
          )
        )
      );
    };

    return RecipeIngredientsListControl;
  })(Component);

  var RecipeStepsListControl = (function (Super) {
    function RecipeStepsListControl(props) {
      Super.call(this, props);
    }

    if (Super) RecipeStepsListControl.__proto__ = Super;
    RecipeStepsListControl.prototype = Object.create(Super && Super.prototype);
    RecipeStepsListControl.prototype.constructor = RecipeStepsListControl;

    RecipeStepsListControl.prototype.render = function () {
      var self = this;
      var items = Array.isArray(this.props.value)
        ? this.props.value.map(normalizeStepItem)
        : [];

      function updateItems(next) {
        self.props.onChange(next);
      }

      function updateAt(index, value) {
        var next = items.slice();
        next[index] = value;
        updateItems(next);
      }

      function removeAt(index) {
        updateItems(
          items.filter(function (_, itemIndex) {
            return itemIndex !== index;
          })
        );
      }

      return h(
        "div",
        { className: "recipe-list-editor" },
        items.length === 0
          ? h("p", { className: "recipe-notes-empty" }, "No steps yet.")
          : items.map(function (item, index) {
              if (isStepSectionItem(item)) {
                return h(
                  "div",
                  { key: index, className: "recipe-list-item" },
                  h(RecipeSectionControl, {
                    value: item,
                    forID: self.props.forID + "-step-" + index,
                    onChange: function (value) {
                      updateAt(index, value);
                    },
                  }),
                  listRemoveButton(function () {
                    removeAt(index);
                  })
                );
              }

              return h(
                "div",
                { key: index, className: "recipe-list-item" },
                h(RecipeStepControl, {
                  value: item,
                  forID: self.props.forID + "-step-" + index,
                  onChange: function (value) {
                    updateAt(index, value);
                  },
                }),
                listRemoveButton(function () {
                  removeAt(index);
                })
              );
            }),
        h(
          "div",
          { className: "recipe-notes-toolbar" },
          h(
            "button",
            {
              type: "button",
              className: "recipe-notes-btn",
              onClick: function () {
                updateItems(items.concat([""]));
              },
            },
            "+ Step"
          ),
          h(
            "button",
            {
              type: "button",
              className: "recipe-notes-btn",
              onClick: function () {
                updateItems(
                  items.concat([{ type: "section", label: "" }])
                );
              },
            },
            "+ Section"
          )
        )
      );
    };

    return RecipeStepsListControl;
  })(Component);

  function registerRecipeWidgets() {
    CMS.registerWidget("recipeUnit", RecipeUnitControl);
    CMS.registerWidget("recipeIngredient", RecipeIngredientControl);
    CMS.registerWidget("recipeSection", RecipeSectionControl);
    CMS.registerWidget("recipeStep", RecipeStepControl);
    CMS.registerWidget("recipeNotes", RecipeNotesControl);
    CMS.registerWidget("recipeTime", RecipeTimeControl);
    CMS.registerWidget("recipeIngredientsList", RecipeIngredientsListControl);
    CMS.registerWidget("recipeStepsList", RecipeStepsListControl);

    CMS.registerEventListener({
      name: "preSave",
      handler: function (_ref) {
        var entry = _ref.entry;

        try {
          fetch("/api/units/track", { method: "POST" });
        } catch (_error) {
          // Non-blocking — save should still proceed
        }

        return entry;
      },
    });
  }

  function initRecipeCms() {
    if (!window.CMS) {
      window.setTimeout(initRecipeCms, 50);
      return;
    }

    registerRecipeWidgets();
  }

  initRecipeCms();
})();
