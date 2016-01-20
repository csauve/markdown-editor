var React = require("react");
var _ = require("underscore");


var availableDomains = [
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
    //find out if any of the available domains have a value provided already, so we can make that tab the selected one
    var data = this.props.valueLink.value || {};
    var domainToSelect = _.find(availableDomains, (domain) => data[domain.propertyPath]);

    return {
      selectedDomain: domainToSelect
    };
  },

  componentDidMount: function() {
    var mdeInstances = {};

    //a textarea was rendered for all domains, so initialize SimpleMDE on each
    for (var domain of availableDomains) {
      var textAreaElement = this.refs["textarea-" + domain.propertyPath];
      var simplemde = new SimpleMDE(_.defaults({element: textAreaElement}, mdeConfig));
      var createHandler = (propertyPath, simplemde) => (
        () => {this.handleEditorContentChanged(propertyPath, simplemde.value());}
      );
      simplemde.codemirror.on("change", createHandler(domain.propertyPath, simplemde));
      mdeInstances[domain.propertyPath] = simplemde;
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

  handleTabClick: function(propertyPath) {
    this.setState({
      selectedDomain: propertyPath
    });
  },

  handleTabRemove: function(propertyPath) {
    this.setPropertyPathValue(propertyPath, null);
    if (propertyPath == this.state.selectedDomain) {
      //deleting the currently selected tab, so find a new one to go to
      var data = this.props.valueLink.value || {};
      var nextDomain = _.find(availableDomains, (domain) => (
        data[domain.propertyPath] && domain.propertyPath != propertyPath
      ));
      this.setState({selectedDomain: nextDomain ? nextDomain.propertyPath : null});
    }
  },

  handleTabAdd: function(e) {
    var propertyPath = e.target.value;
    if (propertyPath && propertyPath != "_") {
      this.setPropertyPathValue(propertyPath, "");
      this.state.mdeInstances[propertyPath].value(""); //clear out the editor
      this.setState({selectedDomain: propertyPath});
    }
  },

  //called after updates are flushed to the DOM, such as switching tabs
  componentDidUpdate: function() {
    //codemirror does not fully initialize when not visible, so make sure it's initialized now
    if (this.state.selectedDomain) {
      this.state.mdeInstances[this.state.selectedDomain].codemirror.refresh();
    }
  },

  render: function() {
    var data = this.props.valueLink.value || {};
    var domainsThatHaveBeenAdded = _.filter(availableDomains, (domain) => data[domain.propertyPath]);
    var domainsThatCanBeAdded = _.filter(availableDomains, (domain) => !data[domain.propertyPath]);
    var hasManyTabs = domainsThatHaveBeenAdded.length > 4;

    return (
      <div className="markdown-editor">
        {this.props.title ? <h3 className="title">{this.props.title}</h3> : null}

        <div className="domain-header">
          <div className="tabs">
            {domainsThatCanBeAdded.length == 0 ? null :
              <select className="domain-select" value="_" onChange={this.handleTabAdd}>
                <option value="_">Add a domain</option>
                {domainsThatCanBeAdded.map((domain) => (
                  <option value={domain.propertyPath}>{domain.message}</option>
                ))}
              </select>
            }

            {domainsThatHaveBeenAdded.map((domain) => {
              var isActiveTab = this.state.selectedDomain == domain.propertyPath;
              var onClickTab = () => {this.handleTabClick(domain.propertyPath)};
              var onRemoveTab = (e) => {
                e.preventDefault();
                this.handleTabRemove(domain.propertyPath);
              };
              return (
                <div className={"tab " + (hasManyTabs ? "narrow " : "") + (isActiveTab ? "active" : "inactive")}>
                  <label className="domain-name" onClick={onClickTab}>{domain.message}</label>
                  <a className="remove-button" onClick={onRemoveTab}><i className="fa fa-times"></i></a>
                </div>
              );
            })}
          </div>
        </div>

        {availableDomains.map((domain) => {
          //create editors for all domains anyway; simpler to set up on `componentDidMount`
          var isActiveEditor = this.state.selectedDomain == domain.propertyPath;
          var domainValue = data[domain.propertyPath];

        })}

      </div>
    );
  }
});