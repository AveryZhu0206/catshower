import React from 'react';
import { InterferenceEvent } from '../types/GameTypes';

interface FallingItem {
  id: string;
  type: 'comb' | 'fish' | 'rubber_duck' | 'alarm_clock' | 'scale_monster';
  x: number;
  y: number;
  speed: number;
}

interface FallingItemsOverlayProps {
  interferenceEvent: InterferenceEvent;
  onItemClick: (itemType: string) => void;
}

export const FallingItemsOverlay: React.FC<FallingItemsOverlayProps> = ({
  interferenceEvent,
  onItemClick,
}) => {
  const [fallingItems, setFallingItems] = React.useState<FallingItem[]>([]);

  // Generate falling items when interference starts
  React.useEffect(() => {
    if (interferenceEvent.type === 'falling_items' && interferenceEvent.isActive) {
      console.log('🎯 Falling items interference started!'); // Debug log
      
      const itemTypes: FallingItem['type'][] = ['comb', 'fish', 'rubber_duck', 'alarm_clock', 'scale_monster'];
      
      // Only generate ONE item at a time
      const randomType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
      const randomX = Math.random() * 300 + 45; // Keep within game area
      const slowSpeed = 0.8; // Much slower speed
      
      console.log(`🎯 Generating 1 falling item: ${randomType}`); // Debug log
      
      const newItem: FallingItem = {
        id: `item-${Date.now()}`,
        type: randomType,
        x: randomX,
        y: -50, // Start above screen
        speed: slowSpeed,
      };
      
      setFallingItems([newItem]);
    } else {
      setFallingItems([]);
    }
  }, [interferenceEvent.type, interferenceEvent.isActive]);

  // Generate new items periodically during the interference
  React.useEffect(() => {
    if (interferenceEvent.type !== 'falling_items' || !interferenceEvent.isActive) return;

    const itemGenerationInterval = setInterval(() => {
      // Only add new item if there are fewer than 2 items on screen
      setFallingItems(prevItems => {
        if (prevItems.length < 2) {
          const itemTypes: FallingItem['type'][] = ['comb', 'fish', 'rubber_duck', 'alarm_clock', 'scale_monster'];
          const randomType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
          const randomX = Math.random() * 300 + 45;
          const slowSpeed = 0.8;
          
          const newItem: FallingItem = {
            id: `item-${Date.now()}`,
            type: randomType,
            x: randomX,
            y: -50,
            speed: slowSpeed,
          };
          
          console.log(`🎯 Adding new falling item: ${randomType}`); // Debug log
          return [...prevItems, newItem];
        }
        return prevItems;
      });
    }, 3000); // Generate new item every 3 seconds

    return () => clearInterval(itemGenerationInterval);
  }, [interferenceEvent.type, interferenceEvent.isActive]);

  // Animate falling items with slower speed
  React.useEffect(() => {
    if (fallingItems.length === 0) return;

    const animationInterval = setInterval(() => {
      setFallingItems(prevItems => 
        prevItems
          .map(item => ({
            ...item,
            y: item.y + item.speed, // Much slower movement (was item.speed * 2)
          }))
          .filter(item => item.y < 800) // Remove items that fell off screen
      );
    }, 16); // ~60fps

    return () => clearInterval(animationInterval);
  }, [fallingItems.length]);

  const getItemEmoji = (type: FallingItem['type']) => {
    const emojiMap = {
      comb: '🪮',
      fish: '🐠',
      rubber_duck: '🦆',
      alarm_clock: '⏰',
      scale_monster: '👾',
    };
    return emojiMap[type];
  };

  const handleItemClick = (item: FallingItem) => {
    console.log(`🎯 Item clicked: ${item.type}`); // Debug log
    onItemClick(item.type);
    
    // Remove clicked item
    setFallingItems(prevItems => 
      prevItems.filter(i => i.id !== item.id)
    );
  };

  if (interferenceEvent.type !== 'falling_items' || !interferenceEvent.isActive) {
    return null;
  }

  return (
    <>
      {/* Interference notification */}
      <div className="absolute top-16 left-4 right-4 z-40">
        <div className="bg-pink-500 text-white p-3 rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center justify-center mb-2">
            <span className="text-2xl mr-2">🎁</span>
            <h3 className="font-bold text-lg">Items Falling!</h3>
          </div>
          <p className="text-center text-sm">Click items to affect comfort!</p>
          <p className="text-center text-xs mt-1 opacity-80">
            🦆🐠 +10% | 🪮👾 -5% | ⏰ -10%
          </p>
        </div>
      </div>

      {/* Falling items - Using emoji directly for now */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        {fallingItems.map(item => (
          <button
            key={item.id}
            className="absolute w-12 h-12 pointer-events-auto transition-transform duration-100 hover:scale-110 active:scale-95 bg-white bg-opacity-80 rounded-lg border-2 border-white shadow-lg flex items-center justify-center"
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
            }}
            onClick={() => handleItemClick(item)}
          >
            <span className="text-3xl">
              {getItemEmoji(item.type)}
            </span>
          </button>
        ))}
      </div>
    </>
  );
};