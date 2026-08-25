import os

filepath = "src/components/layout/ProductTour.tsx"

new_content = """"use client";

import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useRouter, usePathname } from "next/navigation";

export function ProductTour({ startTour, onTourEnd }: { startTour: boolean, onTourEnd: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!startTour) return;

    // Small helper to wait before selecting elements on the new page
    const navigateAndWait = (path: string, callback: () => void) => {
      if (pathname !== path) {
        router.push(path);
        setTimeout(callback, 800); // Allow time for exit/enter animations
      } else {
        callback();
      }
    };

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: false,
      doneBtnText: "Finish Demo",
      nextBtnText: "Next \u2192",
      prevBtnText: "\u2190 Previous",
      steps: [
        {
          element: '#global-search',
          popover: {
            title: 'Global Search',
            description: 'Find faculty, students, or specific research domains instantly.',
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: '#user-menu-button',
          popover: {
            title: 'Your Profile',
            description: 'Manage your settings, switch roles, and update your portfolio here.',
            side: "bottom",
            align: 'end'
          }
        },
        {
          popover: {
            title: 'Dashboard Overview',
            description: 'Let us take a look at your dashboard stats and incoming proposals.',
            side: "bottom",
            align: 'center',
            onNextClick: () => {
              driverObj.moveNext();
              navigateAndWait('/dashboard', () => {});
            }
          }
        },
        {
          element: '.sidebar-nav',
          popover: {
            title: 'Navigation',
            description: 'From here, you can easily access Discover Faculty, Openings, and Messages.',
            side: "right",
            align: 'start',
            onNextClick: () => {
              navigateAndWait('/discover/faculty', () => driverObj.moveNext());
            }
          }
        },
        {
          popover: {
            title: 'Discover Faculty',
            description: 'This is where you can find and filter faculty members based on their research domains.',
            side: "bottom",
            align: 'center',
          }
        },
        {
          popover: {
            title: 'Reach Out',
            description: 'Clicking Reach Out will open a 3-tab modal where you can request Research, Mentorship, or Academic Query slots!',
            side: "bottom",
            align: 'center',
            onNextClick: () => {
              navigateAndWait('/openings', () => driverObj.moveNext());
            }
          }
        },
        {
          popover: {
            title: 'Browse Openings & Capstones',
            description: 'Here you can see all open positions, including specific Capstone Project group slots.',
            side: "bottom",
            align: 'center',
            onNextClick: () => {
              navigateAndWait('/messages', () => driverObj.moveNext());
            }
          }
        },
        {
          popover: {
            title: 'Messages',
            description: 'Track your conversations and coordinate with peers or faculty here.',
            side: "bottom",
            align: 'center',
          }
        },
        {
          popover: {
            title: 'You are all set!',
            description: 'Enjoy using the Research, Academic & Mentorship Portal.',
          }
        }
      ],
      onDestroyed: () => {
        onTourEnd();
      }
    });

    driverObj.drive();
    
    return () => {
      driverObj.destroy();
    }
  }, [startTour, onTourEnd, router, pathname]);

  return null;
}
"""

with open(filepath, "w") as f:
    f.write(new_content)
