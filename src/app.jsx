var React = require("react");
var ReactDOM = require("react-dom");
var MarkdownEditor = require("./components/MarkdownEditor.jsx");


var App = React.createClass({

  getInitialState: function() {
    return {
      selectedTab: null,
      schema: {
        //todo: use schema instead of `availableRegions`
      },
      data: {
        enUS: {
          markdown: "Hello, **USA**!"
        },
        de: {
          markdown: "Hello, Germany!"
        }
      }
    };
  },

  render: function() {
    var dataLink = {
      value: this.state.data,
      requestChange: (newValue) => {
        this.setState({data: newValue});
      }
    };

    return (
      <main>
        <h1>Markdown Editor</h1>
        <MarkdownEditor
          title="Terms of Sale"
          id="example"
          valueLink={dataLink}
          schema={this.state.schema}
        />

        <h2>Data</h2>
        <pre>{JSON.stringify(this.state.data, null, 2)}</pre>
      </main>
    );
  }
});

ReactDOM.render(<App/>, document.getElementById("mountpoint"));