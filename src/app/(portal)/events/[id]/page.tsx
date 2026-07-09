import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { events, eventRsvps } from "@/db/schema/events";
import { users } from "@/db/schema/users";
import { facultyProfiles } from "@/db/schema/profiles";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Info } from "lucide-react";
import { EventRsvpButton } from "@/components/events/EventRsvpButton";

export const metadata = { title: "Event Details — TIET Research Portal" };

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fetch event details
  const result = await db
    .select({
      event: events,
      hostName: users.name,
      hostEmail: users.email,
      hostImage: users.image,
      hostDepartment: facultyProfiles.department,
    })
    .from(events)
    .leftJoin(users, eq(events.hostUserId, users.id))
    .leftJoin(facultyProfiles, eq(users.id, facultyProfiles.userId))
    .where(eq(events.id, id))
    .get();

  if (!result) redirect("/events");

  const { event, hostName, hostDepartment } = result;

  // Get RSVP count
  const [{ count: rsvpCount }] = await db
    .select({ count: db.$count(eventRsvps, eq(eventRsvps.eventId, id)) })
    .from(eventRsvps);

  // Check if current user has RSVP'd
  const userRsvp = await db
    .select()
    .from(eventRsvps)
    .where(and(eq(eventRsvps.eventId, id), eq(eventRsvps.userId, session.user.id)))
    .get();

  const startDate = new Date(event.startTime);
  const isPast = startDate < new Date();
  const isFull = event.capacity ? rsvpCount >= event.capacity : false;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/events"
        className="inline-flex items-center gap-2 text-sm text-noir-400 hover:text-red-400 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Events
      </Link>

      <div className="card-glass-static p-8">
        <div className="flex items-start justify-between mb-6">
          <span className="badge badge-red text-sm px-3 py-1">
            {event.eventType}
          </span>
          {event.status === "cancelled" && (
            <span className="badge badge-red">Cancelled</span>
          )}
        </div>

        <h1
          className="heading-1 text-noir-50 mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {event.title}
        </h1>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-noir-800 flex items-center justify-center border border-noir-700">
            {result.hostImage ? (
              <img src={result.hostImage} alt="" className="w-full h-full rounded-full" />
            ) : (
              <span className="text-noir-400 font-medium">
                {hostName?.charAt(0) || "F"}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-noir-100">
              {hostName || "TIET Faculty"}
            </p>
            <p className="text-xs text-noir-400">
              Host {hostDepartment && `• ${hostDepartment}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] mb-8">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="text-red-400 mt-0.5" size={18} />
              <div>
                <p className="text-xs text-noir-400 mb-0.5">Date</p>
                <p className="text-sm text-noir-100 font-medium">
                  {startDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="text-red-400 mt-0.5" size={18} />
              <div>
                <p className="text-xs text-noir-400 mb-0.5">Time</p>
                <p className="text-sm text-noir-100 font-medium">
                  {startDate.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {event.endTime && (
                    <>
                      {" "}
                      —{" "}
                      {new Date(event.endTime).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="text-red-400 mt-0.5" size={18} />
              <div>
                <p className="text-xs text-noir-400 mb-0.5">Location</p>
                <p className="text-sm text-noir-100 font-medium">
                  {event.location || "TBA"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="text-red-400 mt-0.5" size={18} />
              <div>
                <p className="text-xs text-noir-400 mb-0.5">Capacity</p>
                <p className="text-sm text-noir-100 font-medium">
                  {rsvpCount} / {event.capacity || "Unlimited"} attending
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <h2
            className="heading-3 text-noir-100"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            About this event
          </h2>
          <p className="text-noir-300 text-sm leading-relaxed whitespace-pre-wrap">
            {event.description || "No description provided."}
          </p>
        </div>

        {/* Action Area */}
        <div className="pt-6 border-t border-white/[0.05]">
          {isPast ? (
            <div className="flex items-center gap-2 justify-center p-4 rounded-xl bg-white/[0.02] text-noir-400 text-sm">
              <Info size={16} />
              This event has already taken place
            </div>
          ) : event.status === "cancelled" ? (
            <div className="flex items-center gap-2 justify-center p-4 rounded-xl bg-red-500/10 text-red-400 text-sm">
              <Info size={16} />
              This event was cancelled by the host
            </div>
          ) : (
            <div className="max-w-xs mx-auto">
              <EventRsvpButton
                eventId={event.id}
                hasRsvpd={!!userRsvp}
                isFull={isFull}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
