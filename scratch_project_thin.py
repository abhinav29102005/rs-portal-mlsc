import os

file_path = "src/components/discovery/ProjectDiscovery.tsx"
with open(file_path, "r") as f:
    content = f.read()

target = """        {/* Permanent Top Filter Bar */}
        <div className="card-glass-static p-5 space-y-4">
          <div className="flex items-center gap-2 text-noir-200 font-medium pb-2 border-b border-white/5">
            <SlidersHorizontal size={18} className="text-red-400" />
            Filters
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Search */}
            <div>
              <label className="text-label block mb-2">Search</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-400" />
                <input
                  type="text"
                  placeholder="Title, faculty, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-noir !pl-10"
                />
              </div>
            </div>

            {/* Department Dropdown */}
            <div>
              <label className="text-label block mb-2">Department</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="input-noir bg-noir-800 text-noir-200"
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
                <option value="Other / Interdisciplinary">Other / Interdisciplinary</option>
              </select>
            </div>

            {/* Project Type Dropdown */}
            <div>
              <label className="text-label block mb-2">Project Type</label>
              <select
                value={selectedProjectType}
                onChange={(e) => setSelectedProjectType(e.target.value)}
                className="input-noir bg-noir-800 text-noir-200"
              >
                <option value="">All Types</option>
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            
            {/* Skills Dropdown */}
            <div>
              <label className="text-label block mb-2">Required Skills</label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="input-noir bg-noir-800 text-noir-200"
              >
                <option value="">All Skills</option>
                {allSkills.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            
            {/* Clear Button */}
            <div className="md:col-span-2 lg:col-span-4 flex justify-end mt-2">
              {(searchQuery || selectedDept || selectedProjectType || selectedSkill) && (
                <button
                  onClick={() => {
                    setSelectedDept("");
                    setSelectedProjectType("");
                    setSelectedSkill("");
                    setSearchQuery("");
                  }}
                  className="btn btn-ghost btn-sm text-red-400 hover:bg-red-500/10"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>"""

replacement = """        {/* Permanent Top Filter Bar (Thinner) */}
        <div className="card-glass-static p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-noir !pl-9 py-1.5 text-sm"
              />
            </div>

            {/* Department Dropdown */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="input-noir bg-noir-800 text-noir-200 py-1.5 text-sm"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
              <option value="Other / Interdisciplinary">Other / Interdisciplinary</option>
            </select>

            {/* Project Type Dropdown */}
            <select
              value={selectedProjectType}
              onChange={(e) => setSelectedProjectType(e.target.value)}
              className="input-noir bg-noir-800 text-noir-200 py-1.5 text-sm"
            >
              <option value="">All Types</option>
              {PROJECT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            
            {/* Skills Dropdown */}
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="input-noir bg-noir-800 text-noir-200 py-1.5 text-sm"
            >
              <option value="">All Skills</option>
              {allSkills.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            
            {/* Clear Button */}
            <div className="flex justify-end lg:justify-start">
              {(searchQuery || selectedDept || selectedProjectType || selectedSkill) && (
                <button
                  onClick={() => {
                    setSelectedDept("");
                    setSelectedProjectType("");
                    setSelectedSkill("");
                    setSearchQuery("");
                  }}
                  className="btn btn-ghost py-1 px-3 text-xs text-red-400 hover:bg-red-500/10"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>"""

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, "w") as f:
        f.write(content)
    print("ProjectDiscovery filters updated to be thinner")
else:
    print("Target not found in ProjectDiscovery")
