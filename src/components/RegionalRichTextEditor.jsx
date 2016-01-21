var React = require("react");
var _ = require("underscore");
var RichTextEditor = require("./RichTextEditor.jsx");


var availableDomains = [
  //note that `domainId` is also the property name within the returned object
  {domainId: "com", message: "AbeBooks.com"},
  {domainId: "coUk", message: "AbeBooks.co.uk"},
  {domainId: "it", message: "AbeBooks.it"},
  {domainId: "de", message: "AbeBooks.de / ZVAB.com"},
  {domainId: "es", message: "IberLibro.com"},
  {domainId: "fr", message: "AbeBooks.fr"}
];

/* Implements a multi-tabbed rich text editor with one tab per domain.
 */
module.exports = React.createClass({

  getInitialState: function() {
    var data = this.props.valueLink.value || {};

    //prefer to select a tab that has a value in it already
    var domainToSelect = _.find(availableDomains, (domain) => (
      data[domain.domainId] && data[domain.domainId].markdown
    ));

    return {
      selectedDomainId: domainToSelect ? domainToSelect.domainId : availableDomains[0].domainId
    };
  },

  handleTabClick: function(domainId) {
    this.setState({
      selectedDomainId: domainId
    });
  },

  //called after updates are flushed to the DOM, such as switching tabs
  componentDidUpdate: function() {
    //an editor may now be visible for the first time, so refresh it
    var notifyVisibleEditor = this.state.refreshers[this.state.selectedDomainId];
    if (notifyVisibleEditor) notifyVisibleEditor();
  },

  //when each domain's editor mounts, we need to save a reference to its `notifyVisible` callback for later
  handleEditorMounted: function(domainId, notifyVisible) {
    /* State changes are queued by React for efficiency. You shouldn't reference existing state
     * in a state update (such as when doing a merge) without using the below callback method: */
    this.setState((previousState) => {
      var refreshers = previousState.refreshers || {};
      refreshers[domainId] = notifyVisible;
      return {refreshers: refreshers};
    });
  },

  //called whenever any of the per-domain editors have a new value
  handleChildContentChanged: function(domainId, newValueFromChild) {
    var upwardValue = this.props.valueLink.value || {};
    upwardValue[domainId] = newValueFromChild;
    //sends changes upward to this component's parent
    this.props.valueLink.requestChange(upwardValue);
  },

  render: function() {
    var data = this.props.valueLink.value;

    return (
      <div className="regional-richtext-editor">
        {this.props.title ? <h3 className="title">{this.props.title}</h3> : null}

        <div className="domain-header">
          <div className="tabs">
            {availableDomains.map((domain) => {
              var isActiveTab = this.state.selectedDomainId == domain.domainId;
              var onClickTab = () => {this.handleTabClick(domain.domainId)};
              var markdownProvided = data[domain.domainId] && data[domain.domainId].markdown;
              var classes = "tab" + (isActiveTab ? " active" : " inactive") + (markdownProvided ? " provided" : " missing");
              return (
                <div onClick={onClickTab} className={classes} key={domain.domainId}>
                  <label className="domain-name">{domain.message}</label>
                </div>
              );
            })}
          </div>
        </div>

        {availableDomains.map((domain) => {
          //create editors for all domains anyway; simpler to set up on `componentDidMount`
          var isActiveEditor = this.state.selectedDomainId == domain.domainId;
          var childValueLink = {
            value: this.props.valueLink.value[domain.domainId],
            requestChange: (newValueFromChild) => {
              this.handleChildContentChanged(domain.domainId, newValueFromChild);
            }
          };
          return (
            <div className={"domain-editor " + (isActiveEditor ? "active" : "inactive")} key={domain.domainId}>
              <RichTextEditor
                valueLink={childValueLink}
                onMount={(notifyVisible) => {this.handleEditorMounted(domain.domainId, notifyVisible)}}
              />
            </div>
          );
        })}

      </div>
    );
  }
});