(function () {
  var OTHER = "__other__";
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
          className: self.props.classNameWrapper,
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
              { style: { display: "flex", flexWrap: "wrap", gap: "0.25rem", marginTop: "0.5rem" } },
              quickPicks.map(function (unit) {
                var selected = value.trim().toLowerCase() === unit;
                return h(
                  "button",
                  {
                    key: unit,
                    type: "button",
                    onClick: function () {
                      self.props.onChange(unit);
                    },
                    style: {
                      borderRadius: "9999px",
                      padding: "0.125rem 0.5rem",
                      fontSize: "0.75rem",
                      border: selected ? "none" : "1px solid #d6cfc4",
                      background: selected ? "#7a8f6e" : "transparent",
                      color: selected ? "#faf7f2" : "#6b6560",
                      cursor: "pointer",
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

  CMS.registerWidget("recipeUnit", RecipeUnitControl);

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
      var inputStyle = { width: "4rem", flexShrink: 0 };

      function update(patch) {
        var next = { hours: parts.hours, minutes: parts.minutes };
        for (var key in patch) next[key] = patch[key];
        self.props.onChange(formatRecipeTime(next));
      }

      return h(
        "div",
        { style: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" } },
        h("input", {
          type: "number",
          min: 0,
          className: self.props.classNameWrapper,
          id: self.props.forID,
          style: inputStyle,
          value: parts.hours,
          placeholder: "0",
          onChange: function (event) {
            update({ hours: event.target.value });
          },
        }),
        h("span", { style: { fontSize: "0.75rem", color: "#6b6560" } }, "hr"),
        h("input", {
          type: "number",
          min: 0,
          max: 59,
          className: self.props.classNameWrapper,
          style: inputStyle,
          value: parts.minutes,
          placeholder: "0",
          onChange: function (event) {
            update({ minutes: event.target.value });
          },
        }),
        h("span", { style: { fontSize: "0.75rem", color: "#6b6560" } }, "min")
      );
    };

    return RecipeTimeControl;
  })(Component);

  CMS.registerWidget("recipeTime", RecipeTimeControl);

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
})();
