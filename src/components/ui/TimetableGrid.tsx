"use client";

import { useState } from "react";
import { Plus, X, Clock, MapPin, Video } from "lucide-react";

export type OfficeHour = {
  day: string;
  startTime: string;
  endTime: string;
  mode: "in_person" | "online";
  location: string;
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

interface TimetableGridProps {
  officeHours: OfficeHour[];
  onChange?: (hours: OfficeHour[]) => void;
  editMode?: boolean;
}

export function TimetableGrid({ officeHours, onChange, editMode = false }: TimetableGridProps) {
  const [editingSlot, setEditingSlot] = useState<{ day: string; index?: number } | null>(null);
  const [tempSlot, setTempSlot] = useState<Partial<OfficeHour>>({});

  const handleAddSlot = (day: string) => {
    setTempSlot({ day, mode: "in_person", startTime: "09:00", endTime: "10:00", location: "" });
    setEditingSlot({ day });
  };

  const handleSaveSlot = () => {
    if (!onChange || !tempSlot.day || !tempSlot.startTime || !tempSlot.endTime || !tempSlot.mode) return;
    
    let newHours = [...officeHours];
    if (editingSlot?.index !== undefined) {
      const daySlots = newHours.filter((h) => h.day === tempSlot.day);
      daySlots[editingSlot.index] = tempSlot as OfficeHour;
      newHours = [
        ...newHours.filter((h) => h.day !== tempSlot.day),
        ...daySlots,
      ];
    } else {
      newHours.push(tempSlot as OfficeHour);
    }
    
    newHours.sort((a, b) => a.startTime.localeCompare(b.startTime));
    onChange(newHours);
    setEditingSlot(null);
  };

  const handleDeleteSlot = (day: string, index: number) => {
    if (!onChange) return;
    const daySlots = officeHours.filter((h) => h.day === day);
    daySlots.splice(index, 1);
    const newHours = [
      ...officeHours.filter((h) => h.day !== day),
      ...daySlots,
    ];
    onChange(newHours);
  };

  // ------------------------------------------------------------------
  // DISPLAY MODE: Rectangular Calendar Grid
  // ------------------------------------------------------------------
  if (!editMode) {
    const HOUR_HEIGHT = 70; // px per hour
    
    // Find min and max hours from data, default to 9-17
    let minHour = 9;
    let maxHour = 17;
    officeHours.forEach(h => {
      const startH = parseInt(h.startTime.split(':')[0], 10);
      const endH = parseInt(h.endTime.split(':')[0], 10);
      if (!isNaN(startH) && startH < minHour) minHour = startH;
      if (!isNaN(endH) && endH > maxHour) maxHour = endH;
    });
    
    // Add 1 hour padding at bottom
    maxHour = Math.min(23, maxHour + 1);
    
    const hoursCount = maxHour - minHour + 1;
    const hoursArray = Array.from({length: hoursCount}, (_, i) => minHour + i);

    return (
      <div className="w-full overflow-x-auto pb-4">
        <div className="min-w-[800px] bg-noir-950 border border-white/5 rounded-2xl overflow-hidden flex shadow-2xl">
          {/* Time Axis */}
          <div className="w-20 shrink-0 border-r border-white/5 bg-noir-900/40 relative">
             <div className="h-14 border-b border-white/5"></div> {/* Header spacer */}
             <div className="relative w-full" style={{ height: hoursCount * HOUR_HEIGHT }}>
                {hoursArray.map(h => (
                  <div key={h} className="absolute w-full text-right pr-3 text-xs text-noir-400 font-medium" style={{ top: (h - minHour) * HOUR_HEIGHT - 8 }}>
                     {h === 12 ? '12 PM' : h > 12 ? `${h-12} PM` : `${h} AM`}
                  </div>
                ))}
             </div>
          </div>
          
          {/* Days Grid */}
          <div className="flex-1 flex">
             {DAYS.map((day, i) => (
               <div key={day} className={`flex-1 relative ${i !== 0 ? 'border-l border-white/5' : ''}`}>
                 {/* Header */}
                 <div className="h-14 border-b border-white/5 bg-noir-900/20 flex flex-col items-center justify-center">
                   <h3 className="font-bold text-noir-100">{day}</h3>
                 </div>
                 
                 {/* Grid body */}
                 <div className="relative w-full" style={{ height: hoursCount * HOUR_HEIGHT }}>
                   {/* Grid lines */}
                   {hoursArray.map(h => (
                     <div key={h} className="absolute w-full border-t border-white/5" style={{ top: (h - minHour) * HOUR_HEIGHT, height: HOUR_HEIGHT }}></div>
                   ))}
                   
                   {/* Slots */}
                   {officeHours.filter(h => h.day === day).map((slot, idx) => {
                      const [startH, startM] = slot.startTime.split(':').map(Number);
                      const [endH, endM] = slot.endTime.split(':').map(Number);
                      const top = ((startH - minHour) + (startM / 60)) * HOUR_HEIGHT;
                      const duration = (endH - startH) + ((endM - startM) / 60);
                      const height = Math.max(duration * HOUR_HEIGHT, 24); // min height
                      
                      return (
                        <div key={idx} className="absolute left-1.5 right-1.5 p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/20 backdrop-blur-sm overflow-hidden flex flex-col justify-start hover:border-red-500/40 hover:from-red-500/25 transition-colors group cursor-default" style={{ top, height }}>
                           <div className="text-[10px] font-bold text-red-400 mb-1 flex items-center gap-1.5 opacity-80 group-hover:opacity-100">
                             <Clock size={10} />
                             {slot.startTime} - {slot.endTime}
                           </div>
                           <div className="text-xs text-noir-50 font-medium flex items-center gap-1.5">
                             {slot.mode === 'in_person' ? <MapPin size={12} className="text-noir-400" /> : <Video size={12} className="text-noir-400" />}
                             <span className="truncate">{slot.mode === 'in_person' ? 'In Person' : 'Online'}</span>
                           </div>
                           {slot.location && (
                             <div className="text-[10px] text-noir-300 truncate mt-1 pl-4 opacity-80">
                               {slot.location}
                             </div>
                           )}
                        </div>
                      );
                   })}
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // EDIT MODE: List View (Easier for managing)
  // ------------------------------------------------------------------
  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-[800px] grid grid-cols-5 gap-4">
        {DAYS.map((day) => {
          const slots = officeHours.filter((h) => h.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
          
          return (
            <div key={day} className="flex flex-col space-y-3">
              <div className="card-glass-static p-3 text-center rounded-xl bg-noir-900 border-b-2 border-red-500">
                <h3 className="font-bold text-noir-100">{day}</h3>
              </div>

              <div className="flex-1 space-y-2">
                {slots.map((slot, index) => (
                  <div key={index} className="card-glass p-3 relative group text-sm border-l-2 border-l-amber-500">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1.5 text-noir-100 font-medium">
                        <Clock size={14} className="text-red-500" />
                        {slot.startTime} - {slot.endTime}
                      </div>
                      <button 
                        onClick={() => handleDeleteSlot(day, index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:bg-red-500/20 p-1 rounded"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-noir-400 mt-1">
                      {slot.mode === "in_person" ? <MapPin size={12} /> : <Video size={12} />}
                      <span className="truncate">{slot.location || (slot.mode === "in_person" ? "Office" : "Online")}</span>
                    </div>
                  </div>
                ))}

                {slots.length === 0 && (
                  <div className="p-3 text-center text-xs text-noir-500 bg-white/5 rounded-xl border border-white/5 border-dashed">
                    No availability
                  </div>
                )}

                {editingSlot?.day !== day && (
                  <button 
                    onClick={() => handleAddSlot(day)}
                    className="w-full p-2 flex items-center justify-center gap-2 text-xs text-noir-400 hover:text-red-400 border border-dashed border-white/10 hover:border-red-500/30 rounded-xl transition-all"
                  >
                    <Plus size={14} /> Add Slot
                  </button>
                )}

                {editingSlot?.day === day && (
                  <div className="card-glass p-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-noir-400 mb-1 block">Start</label>
                        <input 
                          type="time" 
                          value={tempSlot.startTime}
                          onChange={e => setTempSlot({...tempSlot, startTime: e.target.value})}
                          className="w-full bg-noir-900 border border-white/10 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-noir-400 mb-1 block">End</label>
                        <input 
                          type="time" 
                          value={tempSlot.endTime}
                          onChange={e => setTempSlot({...tempSlot, endTime: e.target.value})}
                          className="w-full bg-noir-900 border border-white/10 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <select 
                        value={tempSlot.mode}
                        onChange={e => setTempSlot({...tempSlot, mode: e.target.value as any})}
                        className="w-full bg-noir-900 border border-white/10 rounded px-2 py-1 text-xs text-white"
                      >
                        <option value="in_person">In Person</option>
                        <option value="online">Online</option>
                      </select>
                    </div>
                    <div>
                      <input 
                        type="text" 
                        placeholder="Location / Link"
                        value={tempSlot.location}
                        onChange={e => setTempSlot({...tempSlot, location: e.target.value})}
                        className="w-full bg-noir-900 border border-white/10 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={handleSaveSlot} className="flex-1 bg-red-500/20 text-red-400 py-1 rounded text-xs hover:bg-red-500/30">Save</button>
                      <button onClick={() => setEditingSlot(null)} className="flex-1 bg-white/5 text-noir-300 py-1 rounded text-xs hover:bg-white/10">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
