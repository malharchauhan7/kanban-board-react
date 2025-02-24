import React, { useEffect, useState } from "react";
import { FiPlus, FiTrash } from "react-icons/fi";
import { motion } from "framer-motion";
import { FaFire } from "react-icons/fa";
import Linkify from "linkify-react";
export const Kanban = () => {
  return (
    <div className="min-h-screen w-full bg-neutral-900 text-neutral-50 p-4">
      <Board />
    </div>
  );
};
export default Kanban;

const Board = () => {
  const [cards, setCards] = useState([]);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    hasChecked && localStorage.setItem("cards", JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    const cardData = localStorage.getItem("cards");
    setCards(cardData ? JSON.parse(cardData) : []);
    setHasChecked(true);
  }, []);

  return (
    <div className="flex flex-wrap gap-3 overflow-x-auto p-4 justify-center">
      {["Backlog", "TODO", "In Progress", "Revision", "Completed"].map(
        (title, index) => {
          const column = ["backlog", "todo", "doing", "done"][index];
          const colors = [
            "text-neutral-500",
            "text-yellow-200",
            "text-blue-200",
            "text-gray-200",
            "text-emerald-200",
          ];
          return (
            <Column
              key={column}
              title={title}
              column={column}
              headingColor={colors[index]}
              cards={cards}
              setCards={setCards}
            />
          );
        }
      )}
      <BurnBarrel setCards={setCards} />
    </div>
  );
};

const Column = ({ title, headingColor, column, cards, setCards }) => {
  const [active, setActive] = useState(false);

  const handleDragStart = (e, card) => {
    e.dataTransfer.setData("cardId", card.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setActive(true);
  };

  const handleDragLeave = () => {
    setActive(false);
  };

  const handleDragEnd = (e) => {
    setActive(false);
    const cardId = e.dataTransfer.getData("cardId");

    let copy = [...cards];
    let cardToTransfer = copy.find((c) => c.id === cardId);
    if (!cardToTransfer) return;

    cardToTransfer = { ...cardToTransfer, column };
    copy = copy.filter((c) => c.id !== cardId);
    copy.push(cardToTransfer);
    setCards(copy);
  };

  const filteredCards = cards.filter((c) => c.column === column);

  return (
    <div className="w-full sm:w-64 flex-shrink-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-medium ${headingColor}`}>{title}</h3>
        <span className="text-sm text-neutral-400">{filteredCards.length}</span>
      </div>
      <div
        onDrop={handleDragEnd}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        className={`min-h-[100px] w-full p-2 rounded-md transition-colors ${
          active ? "bg-neutral-800/50" : "bg-neutral-800/0"
        }`}
      >
        {filteredCards.map((c) => (
          <Card key={c.id} {...c} handleDragStart={handleDragStart} />
        ))}
        <AddCard column={column} setCards={setCards} />
      </div>
    </div>
  );
};

const Card = ({ title, id, column, handleDragStart }) => {
  return (
    <motion.div
      layout
      layoutId={id}
      draggable="true"
      onDragStart={(e) => handleDragStart(e, { title, id, column })}
      className="cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 my-1 text-sm active:cursor-grabbing"
    >
      <Linkify>
        <p className="text-neutral-100">{title}</p>
      </Linkify>
    </motion.div>
  );
};

const BurnBarrel = ({ setCards }) => {
  const [active, setActive] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setActive(true);
  };

  const handleDragLeave = () => {
    setActive(false);
  };

  const handleDragEnd = (e) => {
    const cardId = e.dataTransfer.getData("cardId");
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setActive(false);
  };

  return (
    <div
      onDrop={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`mt-10 h-20 w-20 flex-shrink-0 flex items-center justify-center rounded border text-3xl transition-all
        ${
          active
            ? "border-red-800 bg-red-800/20 text-red-500 animate-pulse"
            : "border-neutral-500 bg-neutral-500/20 text-neutral-500"
        }`}
    >
      {active ? <FaFire className="animate-bounce" /> : <FiTrash />}
    </div>
  );
};

const AddCard = ({ column, setCards }) => {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim().length) return;

    const newCard = {
      column,
      title: text.trim(),
      id: Math.random().toString(),
    };
    setCards((prev) => [...prev, newCard]);
    setText("");
    setAdding(false);
  };

  return (
    <>
      {adding ? (
        <motion.form onSubmit={handleSubmit} layout>
          <textarea
            onChange={(e) => setText(e.target.value)}
            autoFocus
            placeholder="Add new task..."
            className="w-full rounded border border-violet-400 bg-violet-400/20 p-2 text-sm focus:outline-0"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => setAdding(false)}
              className="px-3 py-1 text-xs text-neutral-400 hover:text-neutral-50"
            >
              Close
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-neutral-50 text-xs text-neutral-900 px-3 py-1 rounded hover:bg-neutral-300"
            >
              Add <FiPlus />
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.button
          layout
          onClick={() => setAdding(true)}
          className="flex w-full items-center gap-2 px-3 py-2 text-xs text-neutral-400 hover:text-neutral-50"
        >
          Add Card <FiPlus />
        </motion.button>
      )}
    </>
  );
};
