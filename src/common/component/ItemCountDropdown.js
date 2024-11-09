import React from "react";
import { Dropdown } from "react-bootstrap";

const ItemCountDropdown = ({ itemsPerPage, setItemsPerPage }) => {
  const options = [5, 10, 20, 50];

  return (
    <Dropdown className="d-inline mx-2">
      <Dropdown.Toggle variant="secondary" id="dropdown-autoclose-true">
        Show {itemsPerPage} item
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {options.map((option) => (
          <Dropdown.Item
            key={option}
            onClick={() => setItemsPerPage(option)}
            active={itemsPerPage === option}
          >
            {option}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ItemCountDropdown;
