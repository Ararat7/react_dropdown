import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import dropdownData from '../services/DropdownData'

export default class Dropdown extends Component {
    constructor(props) {
        super(props);

        this.state = {
            openedItems: []
        };

        this.el = document.getElementById('dropdown-root');

        document.addEventListener('click', this.onClickOutside.bind(this), false);
    }

    onClickOutside(e) {
        if (!e.target.closest('#dropdown-root, .level-0')) {
            this.setState(() => {
                return {
                    openedItems: []
                };
            });
        }
    }

    onClick(e, index, level) {
        e.stopPropagation();

        this.setState((prevState) => {
            let stateObj = JSON.parse(JSON.stringify(prevState));

            // hide higher levels
            if (stateObj.openedItems.length > level) {
                stateObj.openedItems = stateObj.openedItems.slice(0, level + 1);
            }

            // close all lists on the same level and toggle the needed one
            let newState = stateObj.openedItems[level] ? !stateObj.openedItems[level][index] : true;
            stateObj.openedItems[level] = [];
            stateObj.openedItems[level][index] = newState;

            return stateObj;
        });
    }

    buildDropdown(dropdownData, level = 0, parentId = 'root') {
        let listItems = dropdownData.map((el, i) => {
            let isSubtreeVisible = el.children && this.state.openedItems[level] && this.state.openedItems[level][i];
            let subTree = isSubtreeVisible && (level === 0 ?
                ReactDOM.createPortal(this.buildDropdown(el.children, level + 1, el.id), this.el) :
                this.buildDropdown(el.children, level + 1, el.id));

            return (
                <li
                    className={isSubtreeVisible ? `open` : ``}
                    onClick={(e) => {
                        this.onClick(e, i, level)
                    }}
                    key={el.id}>
                    <a href={el.link}>{el.label}</a>
                    {subTree}
                </li>
            );
        });

        return (
            <ReactCSSTransitionGroup
                transitionName="example"
                transitionAppear={true}
                transitionAppearTimeout={500}
                transitionEnterTimeout={500}
                transitionLeaveTimeout={500}>
                <ul key={parentId}
                    className={`level-${level}`}
                    ref={node => this.handleRef(node, level)}>
                    {listItems}
                </ul>
            </ReactCSSTransitionGroup>
        );
    }

    handleRef(node, level) {
        if (level === 1) {
            this.ul = node;
        }
    }

    componentDidUpdate() {
        // update position of the 1-st level ul
        if (this.state.openedItems[0] && this.ul) {
            let index = this.state.openedItems[0].indexOf(true);
            if (!~index) {
                return;
            }

            let li = document.querySelectorAll('.level-0 li')[index];
            let rect = li.getBoundingClientRect();

            this.ul.style.top = `${rect.top}px`;
            this.ul.style.left = `${rect.left + rect.width + 2}px`;
        }
    }

    render() {
        return this.buildDropdown(dropdownData);
    }

};