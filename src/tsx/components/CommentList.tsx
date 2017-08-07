import * as React from "react";
import { List } from "office-ui-fabric-react/lib/List";
import {
  FocusZone, FocusZoneDirection
} from "office-ui-fabric-react/lib/FocusZone";
import { CommandBar } from "office-ui-fabric-react/lib/CommandBar";
import { IContextualMenuItem } from "office-ui-fabric-react/lib/ContextualMenu";
import {
  MessageBar, MessageBarType
} from "office-ui-fabric-react/lib/MessageBar";
import CommentsParser from "./../helpers/CommentsParser";
import IComment from "./../model/IComment";

export interface P {
  comments: IComment[];
}

export interface S {
  newResponseId: number | null;
  addEmptyMessage: number | null;
}

export default class CommentList extends React.Component<P, S> {

  constructor(props: P) {
    super(props);
    this.state = {
      newResponseId: null,
      addEmptyMessage: null
    };
  }

  componentDidMount() {
    window.addEventListener("resize", this.setCommentsOffset);
  }

  componentDidUpdate() {
    this.setCommentsOffset();
  }

  renderCards(): JSX.Element {
    const { comments } = this.props;
    const { newResponseId, addEmptyMessage } = this.state;

    return <List items={comments} onRenderCell={(comment: IComment, i) => (
      <div key={i} data-comment-id={comment.id} className="comment-box"
        onMouseOver={e => this.onCommentOver(comment.id)}
        onMouseLeave={e => this.onCommentLeave(comment.id)}>
          <h5 className="comment-author">{comment.author}</h5>
          <p className="comment-content">{comment.content}</p>
          <ul className="comment-responses">
            {!comment.responses ? [] : comment.responses.map((r, j) => (
            <li key={j}>
              <div>
                <h5 className="comment-author">{r.author}</h5>
                <p className="comment-content">{r.content}</p>
              </div>
            </li>
            ))}
          </ul>
          <CommandBar items={newResponseId === comment.id ? [
          {
            key: "acceptResponse",
            name: "Add",
            iconProps: { iconName: "Add" },
            onClick: () => this.onCommentAnswer(comment.id)
          },
          {
            key: "cancelResponse",
            name: "Cancel",
            iconProps: { iconName: "Cancel" },
            onClick: () => this.onCommentAnswer(comment.id, true)
          }] : [
          {
            key: "addResponse",
            name: "Add response",
            iconProps: { iconName: "Add" },
            onClick: () => this.addAnswerPrototype(comment.id)
              }]} />
          {addEmptyMessage === comment.id && <MessageBar
            messageBarType={MessageBarType.error}
            isMultiline={false}
            onDismiss={e => {
              this.setState({ addEmptyMessage: null });
              window.dispatchEvent(new Event("resize"));
            }}>
            Field can't be empty
          </MessageBar>}
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
      if (!mark) { continue; }
      const markOffset = (mark as HTMLElement).offsetTop;
      const markHeight = (mark as HTMLElement).offsetHeight;
      const markMiddle = markOffset + markHeight / 2;
      const commentHeight = comment.offsetHeight;
      const commentOffset = comment.offsetTop;
      const commentMargin = Number((comment.style.marginTop || "0px").slice(0, -2));
      const commentDiff = markMiddle - commentOffset - commentHeight / 2;
      let commentNewMargin = Math.floor(commentMargin + commentDiff);
      comment.style.marginTop = commentNewMargin < 0 ? "0px" : commentNewMargin + "px";
    }
  }

  onCommentOver(id) {
    const mark = document.querySelector(`mark[data-comment-id=\"${id}\"]`);
    if (!mark) { return; }
    mark.classList.add("active");
    const markChildren = mark.querySelectorAll("mark[data-comment-id]");
    for (let m in markChildren) {
      if (!(markChildren[m] instanceof HTMLElement)) { continue; }
      markChildren[m].classList.add("active");
    }
  }
  onCommentLeave(id) {
    const mark = document.querySelector(`mark[data-comment-id=\"${id}\"]`);
    if (!mark) { return; }
    mark.classList.remove("active");
    const markChildren = mark.querySelectorAll("mark[data-comment-id]");
    for (let m in markChildren) {
      if (!(markChildren[m] instanceof HTMLElement)) { continue; }
      markChildren[m].classList.remove("active");
    }
  }

  addAnswerPrototype(id: number) {
    const com = document.querySelector(`.comment-box[data-comment-id="${id}"]`);
    if (!com) { return; }
    const responses = com.querySelector("ul.comment-responses");
    if (!responses) { return; }
    const prototype = document.createElement("li");
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    prototype.appendChild(input);
    (responses as HTMLUListElement).appendChild(prototype);
    this.setState({ newResponseId: id });
    window.dispatchEvent(new Event("resize"));
  }

  onCommentAnswer(id: number, cancel: boolean = false) {
    if (this.state.newResponseId) {
      const ul = document.querySelector(`.comment-box[data-comment-id="${this.state.newResponseId}"] ul.comment-responses`);
      if (!ul) { return; }
      const li = ul.lastElementChild;
      if (li) {
        const input = (li as HTMLLIElement).querySelector("input");
        if (input) {
          if (cancel) {
            (li as HTMLLIElement).remove();
          }
          else {
            const newAnswer = document.createElement("div");
            const newAuthor = document.createElement("h5");
            newAuthor.classList.add("comment-author");
            newAuthor.appendChild(document.createTextNode("Anonymous"));
            const newPara = document.createElement("p");
            newPara.classList.add("comment-content");
            const text = input.value.trim();
            if (text === "") {
              this.setState({ addEmptyMessage: id });
              window.dispatchEvent(new Event("resize"));
              return;
            }
            (input as HTMLInputElement).remove();
            newPara.appendChild(document.createTextNode(text));
            newAnswer.appendChild(newAuthor);
            newAnswer.appendChild(newPara);
            li.appendChild(newAnswer);
          }
          this.setState({ addEmptyMessage: null });
        }
      }
    }
    this.setState({ newResponseId: null });
    window.dispatchEvent(new Event("resize"));
  }

  render() {
    return <div id="comments-wrapper">
      {this.renderCards()}
    </div>;
  }
}