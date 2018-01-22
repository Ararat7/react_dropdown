import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import dropdownData from '../services/DropdownData'

export default class Dropdown extends Component {
    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);
        this.onTopLevelClick = this.onTopLevelClick.bind(this);

        this.el = document.getElementById('dropdown-root');
    }

    onTopLevelClick(e, data) {
        [...this.el.querySelectorAll(':scope > ul')].forEach((el, i) => {
            if (el.classList.contains(data)) {
                if (el.classList.contains('hidden')) {
                    let rect = e.target.getBoundingClientRect();

                    el.style.top = `${rect.top}px`;
                    el.style.left = `${rect.left + rect.width + 2}px`;

                    el.classList.remove('hidden');
                } else {
                    el.classList.add('hidden');
                }
                // el.classList.toggle('hidden');
            } else {
                el.classList.add('hidden');
            }
        });
    }

    onClick(e, index) {
        e.stopPropagation();

        let siblings = e.target.parentNode.childNodes;

        [...siblings].forEach((el, i) => {
            let nestedList = el.querySelector(':scope > ul');
            if (i === index) {
                nestedList && nestedList.classList.toggle("hidden");
            } else {
                nestedList && nestedList.classList.add("hidden");
            }
        });


    }

    buildDropdown(dropdownData) {
        let listItems = dropdownData.map((el, i) => {
            return (
                <li onClick={e => {
                    this.onTopLevelClick(e, `nested-dropdown-${i}`)
                }} key={i}>
                    <a href={el.link}>{el.label}</a>
                    {el.children && (
                        ReactDOM.createPortal((
                            <ul className={`hidden nested-dropdown-${i}`}>
                                {this.buildNestedDropdown(el.children)}
                            </ul>
                        ), this.el)
                    )}
                </li>
            );
        });

        return (
            <ul className="top-level-dropdown">
                {listItems}
            </ul>
        );
    }

    buildNestedDropdown(items) {
        return items.map((el, i) => {
            return (
                <li onClick={(e) => {
                    this.onClick(e, i)
                }} key={i}>
                    <a href={el.link}>{el.label}</a>
                    {el.children && (
                        <ul className={`hidden`}>
                            {this.buildNestedDropdown(el.children)}
                        </ul>
                    )}
                </li>
            );
        });
    }

    componentWillMount() {
        this.dropdown = this.buildDropdown(dropdownData);
    }

    render() {
        return this.dropdown;
    }

};