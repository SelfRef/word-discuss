import * as React from "react";
import { List } from "office-ui-fabric-react/lib/List";
import {
  FocusZone, FocusZoneDirection
} from "office-ui-fabric-react/lib/FocusZone";
import { CommandBar } from "office-ui-fabric-react/lib/CommandBar";
import { IContextualMenuItem } from "office-ui-fabric-react/lib/ContextualMenu";
import CommentsParser from "./../helpers/CommentsParser";
import IComment from "./../model/IComment";

export interface P {
  comments: IComment[];
}

export default class CommentList extends React.Component<P> {

  componentDidMount() {
    window.addEventListener("resize", this.setCommentsOffset);
  }

  componentDidUpdate() {
    this.setCommentsOffset();
  }

  renderCards(): JSX.Element {
    const { comments } = this.props;

    return <List items={comments} onRenderCell={(comment: IComment, i) => (
      <div key={i} data-comment-id={comment.id} className="comment-box">
          <h5 className="comment-author">{comment.author}</h5>
          <p className="comment-content">{comment.content}</p>
          <ul className="comment-responses">
            {!comment.responses ? [] : comment.responses.map((r, j) => (
              <li key={j}><p>{r.content}</p></li>
            ))}
          </ul>
          <CommandBar items={[
          {
            key: "addResponse",
            name: "Add response",
            iconProps: { iconName: "CommentAdd" }
          }
          ]}/>
        </div>
      )} />;
  }

  setCommentsOffset() {
    const html = document;
    const comments = html.querySelectorAll("div.comment-box");
    for (let c in comments) {
      if (!(comments[c] instanceof HTMLDivElement)) { continue; }
      const comment = comments[c] as HTMLDivElement;
      const id = comment.getAttribute("data-comment-id");
      const mark = html.querySelector(`mark[data-comment-id="${id}"]`);
      const offset = String((mark as HTMLElement).offsetTop);
      comment.style.top = mark ? offset + "px" : "0";
    }
  }

  onMouseOver(id) {
    let mark = document.querySelector(`mark[data-comment-id=\"${id}\"]`);
    if (mark) { mark.classList.add("active"); }
  }
  onMouseLeave(id) {
    let mark = document.querySelector(`mark[data-comment-id=\"${id}\"]`);
    if (mark) { mark.classList.remove("active"); }
  }

  render() {
    return <div id="comments-wrapper">
      {this.renderCards()}
    </div>;
  }
}