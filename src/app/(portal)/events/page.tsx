import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { events } from "@/db/schema/events";
import { users } from "@/db/schema/users";
import { facultyProfiles } from "@/db/schema/profiles";
import { eq, desc, gte, asc } from "drizzle-orm";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Clock,
  ArrowRight,
} from "lucide-react";

export const metadata = { title: "Events & Seminars — TIET Research Portal" };

export default async function EventsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isFacultyOrAdmin =
    session.user.role === "faculty" || session.user.role === "admin";

  // Fetch upcoming events
  const now = new Date();
  const bufferDate = new Date();
  bufferDate.setHours(bufferDate.getHours() - 24); // Show events from past 24h

  const upcomingEvents = await db
    .select({
      event: events,
      hostName: users.name,
      hostDepartment: facultyProfiles.department,
    })
    .from(events)
    .leftJoin(users, eq(events.hostUserId, users.id))
    .leftJoin(facultyProfiles, eq(users.id, facultyProfiles.userId))
    .where(gte(events.startTime, bufferDate))
    .orderBy(asc(events.startTime))
    .all();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-label mb-1">Campus</p>
          <h1
            className="heading-1 text-noir-50"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Events &{" "}
            <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
              Seminars
            </span>
          </h1>
          <p className="text-noir-400 mt-2 max-w-2xl">
            Discover upcoming research talks, workshops, and lab open houses.
          </p>
        </div>

        {isFacultyOrAdmin && (
          <Link href="/events/new" className="btn btn-primary gap-2">
            <Plus size={16} />
            Create Event
          </Link>
        )}
      </div>

      {upcomingEvents.length === 0 ? (
        <div className="card-glass-static p-12 text-center">
          <Calendar size={40} className="text-noir-500 mx-auto mb-4" />
          <p className="text-noir-300">No upcoming events</p>
          <p className="text-noir-500 text-sm mt-2">
            Check back later for new seminars and workshops.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingEvents.map(({ event, hostName, hostDepartment }) => {
            const startDate = new Date(event.startTime);
            const isToday = startDate.toDateString() === now.toDateString();
            const isPast = startDate < now && !isToday;

            return (
              <div
                key={event.id}
                className={`card-glass p-5 flex flex-col ${
                  isPast ? "opacity-60 grayscale-[50%]" : ""
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="badge badge-amber">{event.eventType}</span>
                    {isToday && (
                      <span className="badge badge-rose animate-pulse">Today</span>
                    )}
                  </div>

                  <h3
                    className="heading-3 text-noir-50 mb-2 line-clamp-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {event.title}
                  </h3>

                  <p className="text-sm text-amber-400 mb-4 line-clamp-1">
                    {hostName || "TIET Faculty"}{" "}
                    {hostDepartment && (
                      <span className="text-noir-500">— {hostDepartment}</span>
                    )}
                  </p>

                  <div className="space-y-2 text-sm text-noir-300">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-noir-500 flex-shrink-0" />
                      <span>
                        {startDate.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        •{" "}
                        {startDate.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {event.location && (
                      <div className="flex items-start gap-2">
                        <MapPin
                          size={14}
                          className="text-noir-500 flex-shrink-0 mt-0.5"
                        />
                        <span className="line-clamp-2">{event.location}</span>
                      </div>
                    )}

                    {event.capacity && (
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-noir-500 flex-shrink-0" />
                        <span>{event.capacity} seats max</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/[0.05]">
                  <Link
                    href={`/events/${event.id}`}
                    className="btn btn-secondary w-full gap-2 group"
                  >
                    View Details
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
