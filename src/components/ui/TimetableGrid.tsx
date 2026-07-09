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
      // Editing existing
      const daySlots = newHours.filter((h) => h.day === tempSlot.day);
      daySlots[editingSlot.index] = tempSlot as OfficeHour;
      newHours = [
        ...newHours.filter((h) => h.day !== tempSlot.day),
        ...daySlots,
      ];
    } else {
      // Adding new
      newHours.push(tempSlot as OfficeHour);
    }
    
    // Sort slots by time
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

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-[800px] grid grid-cols-5 gap-4">
        {DAYS.map((day) => {
          const slots = officeHours.filter((h) => h.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
          
          return (
            <div key={day} className="flex flex-col space-y-3">
              {/* Header */}
              <div className="card-glass-static p-3 text-center rounded-xl bg-noir-900 border-b-2 border-teal-500">
                <h3 className="font-bold text-noir-100">{day}</h3>
              </div>

              {/* Slots */}
              <div className="flex-1 space-y-2">
                {slots.map((slot, index) => (
                  <div key={index} className="card-glass p-3 relative group text-sm border-l-2 border-l-amber-500">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1.5 text-noir-100 font-medium">
                        <Clock size={14} className="text-amber-500" />
                        {slot.startTime} - {slot.endTime}
                      </div>
                      {editMode && (
                        <button 
                          onClick={() => handleDeleteSlot(day, index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-400 hover:bg-rose-500/20 p-1 rounded"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-noir-400 mt-1">
                      {slot.mode === "in_person" ? <MapPin size={12} /> : <Video size={12} />}
                      <span className="truncate">{slot.location || (slot.mode === "in_person" ? "Office" : "Online")}</span>
                    </div>
                  </div>
                ))}

                {slots.length === 0 && !editMode && (
                  <div className="p-3 text-center text-xs text-noir-500 bg-white/5 rounded-xl border border-white/5 border-dashed">
                    No availability
                  </div>
                )}

                {/* Edit Mode Add Button */}
                {editMode && editingSlot?.day !== day && (
                  <button 
                    onClick={() => handleAddSlot(day)}
                    className="w-full p-2 flex items-center justify-center gap-2 text-xs text-noir-400 hover:text-teal-400 border border-dashed border-white/10 hover:border-teal-500/30 rounded-xl transition-all"
                  >
                    <Plus size={14} /> Add Slot
                  </button>
                )}

                {/* Edit Form */}
                {editMode && editingSlot?.day === day && (
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
                      <button onClick={handleSaveSlot} className="flex-1 bg-teal-500/20 text-teal-400 py-1 rounded text-xs hover:bg-teal-500/30">Save</button>
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
