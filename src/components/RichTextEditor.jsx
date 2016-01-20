var React = require("react");
var SimpleMDE = require("simplemde");

var mdeConfig = {
  autofocus: false,
  toolbar: ["bold", "italic", "heading-1", "heading-2", "unordered-list", "ordered-list", "preview"],
  toolbarTips: false,
  spellChecker: false
};

/* Implements a wysiwyg-ish markdown editor by wrapping the simplemde library:
 * https://github.com/NextStepWebs/simplemde-markdown-editor
 */
module.exports = React.createClass({
  // Called after the initially rendered markup is put into the DOM. Time to initialize SimpleMDE
  componentDidMount: function() {
    var textAreaElement = this.refs["mde-textarea"];
    var simplemde = new SimpleMDE(_.defaults({element: textAreaElement}, mdeConfig));

    var changeHandler = () => {this.handleEditorContentChanged(simplemde.value())};
    simplemde.codemirror.on("change", createHandler(domain.propertyPath, simplemde));

    /* Codemirror does not fully initialize when not visible (e.g. in a `display: none` container).
     * This component does not know if it's visible or not, but some parent component will.
     * Once mounted, a function is given to the parent to call when this component is made visible. */
    var notifyVisible = () => {
      simplemde.codemirror.refresh();
    };
    this.props.onMount(notifyVisible);
  },

  handleEditorContentChanged: function(newMarkdown) {
    this.props.valueLink.requestChange(newMarkdown ? {markdown : newMarkdown} : null);
  },

  render: function() {
    var richText = this.props.valueLink.value;
    var markdown = (richText && richText.markdown) ? richText.markdown : "";
    return (
      <div className="richtext-editor">
        <div className="simplemde-wrapper">
          <textarea ref="mde-textarea" defaultValue={markdown}/>
        </div>
      </div>
    );
  }
});