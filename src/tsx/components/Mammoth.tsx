import * as React from "react";
import { Callout } from "office-ui-fabric-react/lib/Callout";
import { CommandBar } from "office-ui-fabric-react/lib/CommandBar";

export interface P {
  document: Document | null;
}
interface S {
  calloutPosition: MouseEvent | null;
  selectedText: string;
}

export default class Mammoth extends React.Component<P, S> {
  constructor(props: P) {
    super();
    this.onCalloutDismiss = this.onCalloutDismiss.bind(this);
    this.state = {
      calloutPosition: null,
      selectedText: ""
    };
  }

  componentDidMount() {
    let doc = document.getElementById("mammoth-preview");
    if (doc) {
      doc.onmouseup = (event) => {
        let selection = document.getSelection();
        let selectionText = selection.toString();
        if (selectionText !== "") {
          console.log(selectionText);
          this.setState({
            selectedText: selectionText,
            calloutPosition: event
          });
        } else {
          this.setState({
            selectedText: "",
            calloutPosition: null
          });
        }
      };
    }
  }

  componentDidUpdate() {
    this.addMarkEvents(document.body);
  }

  componentWillReceiveProps(props: P) {
    const doc = props.document;
  }

  onCalloutDismiss(event) {
    this.setState({
      calloutPosition: null,
      selectedText: ""
    });
  }

  addMarkEvents(html: HTMLElement) {
    const marks = html.querySelectorAll("mark[data-comment-id]");
    for (let m in marks) {
      if (!(marks[m] instanceof HTMLElement)) { continue; }
      const id = marks[m].getAttribute("data-comment-id");
      marks[m].addEventListener("mouseover", () => {
        const comEl = document.querySelector(`div.comment-box[data-comment-id=\"${id}\"]`);
        if (comEl) { comEl.classList.add("active"); }
      });
      marks[m].addEventListener("mouseleave", () => {
        const comEl = document.querySelector(`div.comment-box[data-comment-id=\"${id}\"]`);
        if (comEl) { comEl.classList.remove("active"); }
      });
    }
  }

  render() {
    const { calloutPosition, selectedText } = this.state;
    const { document } = this.props;
    const docContent = document ? document.body.innerHTML : null;

    return <div>
      <div
      dangerouslySetInnerHTML={{__html: docContent ? docContent : "" }}
        id="mammoth-preview" />
      {calloutPosition && <Callout
        target={ calloutPosition }
        onDismiss={ this.onCalloutDismiss }
        setInitialFocus={true}>
        <div className="callout-content">
          <h2 className="ms-font-xl">Add comment</h2>
          <p>"{selectedText}"</p>
          <textarea></textarea>
        </div>
        <CommandBar items={[
          {
            key: "add",
            name: "Add",
            iconProps: { iconName: "Add" }
          }
        ]}/>
      </Callout>}
    </div>;
  }
}