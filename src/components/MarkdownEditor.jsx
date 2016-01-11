var React = require("react");
var SimpleMDE = require("simplemde");
var _ = require("underscore");

var mdeConfig = {
  autofocus: false,
  toolbar: ["bold", "italic", "heading-2", "heading-3", "unordered-list", "ordered-list", "preview"],
  toolbarTips: false,
  spellChecker: false
};

var availableRegions = [
  {propertyPath: "enUS", message: "English (US)"},
  {propertyPath: "enUK", message: "English (UK)"},
  {propertyPath: "it", message: "Italian"},
  {propertyPath: "de", message: "German"},
  {propertyPath: "es", message: "Spanish"},
  {propertyPath: "fr", message: "French"}
];


/* Multilingual wrapper for:
 * https://github.com/NextStepWebs/simplemde-markdown-editor
 */
module.exports = React.createClass({

  getInitialState: function() {
    //find out if any of the available regions have a value provided already, so we can make that tab the selected one
    var data = this.props.valueLink.value || {};
    var selectedRegion = _.find(availableRegions, (region) => data[region.propertyPath]);

    return {
      selectedRegion: selectedRegion ? selectedRegion.propertyPath : null
    };
  },

  componentDidMount: function() {
    var mdeInstances = {};

    //a textarea was rendered for all regions, so initialize SimpleMDE on each
    for (var region of availableRegions) {
      var textAreaElement = this.refs["textarea-" + region.propertyPath];
      var simplemde = new SimpleMDE(_.defaults({element: textAreaElement}, mdeConfig));
      var createHandler = (propertyPath, simplemde) => (
        () => {this.handleEditorContentChanged(propertyPath, simplemde.value());}
      );
      simplemde.codemirror.on("change", createHandler(region.propertyPath, simplemde));
      mdeInstances[region.propertyPath] = simplemde;
    }

    //save references to the instances (need to refresh CodeMirror when they become visible)
    this.setState({
      mdeInstances: mdeInstances
    });
  },

  setPropertyPathValue: function(propertyPath, newValue) {
    var propValue = this.props.valueLink.value || {};
    propValue[propertyPath] = newValue != null ? {markdown: newValue} : null;
    this.props.valueLink.requestChange(propValue);
  },

  //called whenever the user changes the text in any of the tabs editors
  handleEditorContentChanged: function(propertyPath, newValue) {
    this.setPropertyPathValue(propertyPath, newValue);
  },

  handleTabClick: function(propertyPath) {
    this.setState({
      selectedRegion: propertyPath
    });
  },

  handleTabRemove: function(propertyPath) {
    this.setPropertyPathValue(propertyPath, null);
    if (propertyPath == this.state.selectedRegion) {
      //deleting the currently selected tab, so find a new one to go to
      var data = this.props.valueLink.value || {};
      var nextRegion = _.find(availableRegions, (region) => (
        data[region.propertyPath] && region.propertyPath != propertyPath
      ));
      this.setState({selectedRegion: nextRegion ? nextRegion.propertyPath : null});
    }
  },

  handleTabAdd: function(e) {
    var propertyPath = e.target.value;
    if (propertyPath && propertyPath != "_") {
      this.setPropertyPathValue(propertyPath, "");
      this.state.mdeInstances[propertyPath].value(""); //clear out the editor
      this.setState({selectedRegion: propertyPath});
    }
  },

  //called after updates are flushed to the DOM, such as switching tabs
  componentDidUpdate: function() {
    //codemirror does not fully initialize when not visible, so make sure it's initialized now
    if (this.state.selectedRegion) {
      this.state.mdeInstances[this.state.selectedRegion].codemirror.refresh();
    }
  },

  render: function() {
    var data = this.props.valueLink.value || {};
    var regionsThatHaveBeenAdded = _.filter(availableRegions, (region) => data[region.propertyPath]);
    var regionsThatCanBeAdded = _.filter(availableRegions, (region) => !data[region.propertyPath]);
    var hasManyTabs = regionsThatHaveBeenAdded.length > 4;

    return (
      <div className="markdown-editor">
        {this.props.title ? <h3 className="title">{this.props.title}</h3> : null}

        <div className="region-header">
          <div className="tabs">
            {regionsThatCanBeAdded.length == 0 ? null :
              <select className="region-select" value="_" onChange={this.handleTabAdd}>
                <option value="_">Add a region</option>
                {regionsThatCanBeAdded.map((region) => (
                  <option value={region.propertyPath}>{region.message}</option>
                ))}
              </select>
            }

            {regionsThatHaveBeenAdded.map((region) => {
              var isActiveTab = this.state.selectedRegion == region.propertyPath;
              var onClickTab = () => {this.handleTabClick(region.propertyPath)};
              var onRemoveTab = (e) => {
                e.preventDefault();
                this.handleTabRemove(region.propertyPath);
              };
              return (
                <div className={"tab " + (hasManyTabs ? "narrow " : "") + (isActiveTab ? "active" : "inactive")}>
                  <label className="region-name" onClick={onClickTab}>{region.message}</label>
                  <a className="remove-button" onClick={onRemoveTab}><i className="fa fa-times"></i></a>
                </div>
              );
            })}
          </div>
        </div>

        {availableRegions.map((region) => {
          //create editors for all regions anyway; simpler to set up on `componentDidMount`
          var isActiveEditor = this.state.selectedRegion == region.propertyPath;
          var regionValue = data[region.propertyPath];
          return (
            <div className={"editor " + (isActiveEditor ? "active" : "inactive")}>
              <div className="simplemde-wrapper">
                <textarea
                  ref={"textarea-" + region.propertyPath}
                  id={this.props.id + "-textarea-" + region.propertyPath}
                  defaultValue={regionValue ? regionValue.markdown : ""}>
                </textarea>
              </div>
            </div>
          );
        })}

      </div>
    );
  }
});