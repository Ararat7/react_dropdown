import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import dropdownData from '../services/DropdownData'

export default class Dropdown extends Component {
    constructor(props) {
        super(props);

        this.state = {
            levels: []
        };

        this.el = document.getElementById('dropdown-root');

        document.addEventListener('click', this.onClickOutside.bind(this), false);
    }

    onClickOutside(e) {
        if (!e.target.closest('#dropdown-root, .level-0')) {
            this.setState(() => {
                return {
                    levels: []
                };
            });
        }
    }

    onClick(e, index, level) {
        e.stopPropagation();

        this.setState((prevState) => {
            // hide higher levels
            if (prevState.levels.length > level) {
                prevState.levels = prevState.levels.slice(0, level + 1);
            }

            // close all lists on the same level and toggle the needed one
            let newState = prevState.levels[level] ? !prevState.levels[level][index] : true;
            prevState.levels[level] = [];
            prevState.levels[level][index] = newState;

            return prevState;
        });
    }

    buildDropdown(dropdownData, level = 0) {
        let listItems = dropdownData.map((el, i) => {
            let isSubtreeVisible = el.children && this.state.levels[level] && this.state.levels[level][i];

            return (
                <li
                    className={isSubtreeVisible ? `open` : ``}
                    onClick={(e) => {
                        this.onClick(e, i, level)
                    }}
                    key={i}>
                    <a href={el.link}>{el.label}</a>
                    {isSubtreeVisible && (
                        level === 0 ?
                            ReactDOM.createPortal(this.buildDropdown(el.children, level + 1), this.el) :
                            this.buildDropdown(el.children, level + 1)
                    )}
                </li>
            );
        });

        return (
            <ul
                className={`level-${level}`}
                ref={node => this.handleRef(node, level)}>
                {listItems}
            </ul>
        );
    }

    handleRef(node, level) {
        if (level === 1) {
            this.ul = node;
        }
    }

    componentDidUpdate() {
        // update position of the 1-st level ul
        if (this.state.levels[0] && this.ul) {
            let index = this.state.levels[0].indexOf(true);
            if (!~index) {
                return;
            }

            let li = document.querySelectorAll('.level-0 > li')[index];
            let rect = li.getBoundingClientRect();

            this.ul.style.top = `${rect.top}px`;
            this.ul.style.left = `${rect.left + rect.width + 2}px`;
        }
    }

    render() {
        return this.buildDropdown(dropdownData);
    }

};