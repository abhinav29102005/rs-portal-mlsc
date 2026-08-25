import os

file_path = "src/components/mentors/MentorDirectory.tsx"
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
                  placeholder="Name, company, bio..."
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

            {/* Domain Dropdown */}
            <div>
              <label className="text-label block mb-2">Mentorship / Domain</label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="input-noir bg-noir-800 text-noir-200"
              >
                <option value="">All Domains</option>
                {allDomains.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
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
            
            {/* Toggles & Clear */}
            <div className="md:col-span-2 lg:col-span-4 flex flex-wrap items-center justify-between gap-4 mt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={acceptingOnly}
                    onChange={(e) => setAcceptingOnly(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-5 rounded-full transition-colors ${
                      acceptingOnly ? "bg-red-500" : "bg-noir-600"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${
                        acceptingOnly ? "translate-x-5 ml-0.5" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-noir-200 group-hover:text-red-400 transition-colors">
                  Only show faculty accepting students
                </span>
              </label>

              {(searchQuery || selectedDept || selectedDomain || selectedProjectType || acceptingOnly) && (
                <button
                  onClick={() => {
                    setSelectedDept("");
                    setSelectedDomain("");
                    setSelectedProjectType("");
                    setAcceptingOnly(false);
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
                placeholder="Search name, bio..."
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

            {/* Domain Dropdown */}
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="input-noir bg-noir-800 text-noir-200 py-1.5 text-sm"
            >
              <option value="">All Domains</option>
              {allDomains.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
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
            
            {/* Toggles & Clear */}
            <div className="flex flex-wrap items-center justify-between gap-2 lg:justify-end">
              <label className="flex items-center gap-2 cursor-pointer group" title="Only show faculty accepting students">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={acceptingOnly}
                    onChange={(e) => setAcceptingOnly(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-8 h-4 rounded-full transition-colors ${acceptingOnly ? "bg-red-500" : "bg-noir-600"}`}>
                    <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${acceptingOnly ? "translate-x-4 ml-0.5" : "translate-x-0.5"}`} />
                  </div>
                </div>
                <span className="text-xs font-medium text-noir-200 group-hover:text-red-400 transition-colors whitespace-nowrap hidden lg:block xl:hidden">Accepting</span>
                <span className="text-xs font-medium text-noir-200 group-hover:text-red-400 transition-colors whitespace-nowrap lg:hidden xl:block">Accepting students</span>
              </label>

              {(searchQuery || selectedDept || selectedDomain || selectedProjectType || acceptingOnly) && (
                <button
                  onClick={() => {
                    setSelectedDept("");
                    setSelectedDomain("");
                    setSelectedProjectType("");
                    setAcceptingOnly(false);
                    setSearchQuery("");
                  }}
                  className="btn btn-ghost py-1 px-2 text-xs text-red-400 hover:bg-red-500/10"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>"""

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, "w") as f:
        f.write(content)
    print("MentorDirectory filters updated to be thinner")
else:
    print("Target not found in MentorDirectory")
