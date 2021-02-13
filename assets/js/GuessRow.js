import "../css/app.css"

import React from 'react'

export default function GuessRow(props) {
    return (
        <div className="HistoryRow">
            <div className="Yellow Number Cell">{props.index + 1}</div>
            <div className="Cell">{props.guess.guess}</div>
            <div className={props.guess.bulls === "4" ? "Red Cell" : "Cell"}>{props.guess.bulls}</div>
            <div className="Cell">{props.guess.cows}</div>
        </div>
    )
}
