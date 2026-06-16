import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';

interface DiskProps {
  size: number;
  diskId: number;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, diskId: number, towerIndex: number) => void;
  towerIndex: number;
}

const Disk: React.FC<DiskProps> = ({ size, diskId, onDragStart, towerIndex }) => {
  const width = `${size * 20 + 40}px`;
  const color = `hsl(${size * 60}, 70%, 50%)`;

  return (
    <div
      className="h-8 rounded-md flex items-center justify-center text-white cursor-grab mb-1"
      style={{ width, backgroundColor: color }}
      draggable
      onDragStart={(e) => onDragStart(e, diskId, towerIndex)}
    >
      {/* Removed diskId display */}
    </div>
  );
};

interface TowerProps {
  disks: number[];
  towerIndex: number;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetTowerIndex: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, diskId: number, towerIndex: number) => void;
}

const Tower: React.FC<TowerProps> = ({ disks, towerIndex, onDrop, onDragOver, onDragStart }) => {
  return (
    <div
      className="relative w-64 h-80 bg-gray-200 border-b-8 border-gray-700 flex flex-col-reverse items-center justify-start p-2 pt-0"
      onDrop={(e) => onDrop(e, towerIndex)}
      onDragOver={onDragOver}
    >
      <div className="absolute bottom-0 w-2 h-full bg-gray-700"></div>
      {disks.map((diskId) => (
        <Disk
          key={diskId}
          size={diskId}
          diskId={diskId}
          onDragStart={onDragStart}
          towerIndex={towerIndex}
        />
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const NUM_DISKS = 4;
  const initialTowers = Array.from({ length: 3 }, (_, i) =>
    i === 0 ? Array.from({ length: NUM_DISKS }, (_, j) => NUM_DISKS - j) : [],
  );
  const [towers, setTowers] = useState<number[][]>(initialTowers);
  const [draggedDisk, setDraggedDisk] = useState<{ diskId: number; sourceTower: number } | null>(null);

  useEffect(() => {
    checkWinCondition();
  }, [towers]);

  const checkWinCondition = () => {
    const targetTower = towers[2]; // Assuming the last tower is the target
    if (targetTower.length === NUM_DISKS && targetTower.every((disk, i) => disk === NUM_DISKS - i)) {
      toast.success('Congratulations! You completed the Tower of Hanoi!');
    }
  };

  const resetGame = () => {
    setTowers(initialTowers);
    toast.dismiss(); // Clear any existing toasts on reset
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, diskId: number, towerIndex: number) => {
    const topDisk = towers[towerIndex][towers[towerIndex].length - 1];
    if (diskId === topDisk) {
      setDraggedDisk({ diskId, sourceTower: towerIndex });
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', diskId.toString());
    } else {
      e.preventDefault();
      toast.error('You can only move the top disk!');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetTowerIndex: number) => {
    e.preventDefault();
    if (!draggedDisk) {
      // This can happen if drag started on an invalid disk, or if the drag event was somehow interrupted.
      // No toast needed here as the error would have been shown on drag start.
      return;
    }

    const { diskId: droppedDiskId, sourceTower } = draggedDisk;
    const targetTower = towers[targetTowerIndex];
    const topDiskInTarget = targetTower.length > 0 ? targetTower[targetTower.length - 1] : Infinity;

    if (sourceTower === targetTowerIndex) {
      setDraggedDisk(null);
      return;
    }

    if (droppedDiskId < topDiskInTarget) {
      const newTowers = towers.map((tower, index) => {
        if (index === sourceTower) {
          return tower.filter((d) => d !== droppedDiskId);
        } else if (index === targetTowerIndex) {
          return [...tower, droppedDiskId];
        }
        return tower;
      });
      setTowers(newTowers);
    } else {
      toast.error('Cannot place a larger disk on a smaller one!');
    }
    setDraggedDisk(null); // Always clear draggedDisk after a drop attempt
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="text-4xl font-bold mb-8">Hanoi Tower</h1>
      <div className="flex space-x-8 mb-8">
        {towers.map((disks, index) => (
          <Tower
            key={index}
            towerIndex={index}
            disks={disks}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
          />
        ))}
      </div>
      <button
        onClick={resetGame}
        className="px-6 py-3 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
      >
        Reset Game
      </button>
    </div>
  );
};

export default App;
