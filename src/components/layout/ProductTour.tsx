"use client";

import { useEffect, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function ProductTour({ startTour, onTourEnd }: { startTour: boolean, onTourEnd: () => void }) {
  useEffect(() => {
    if (!startTour) return;

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: false,
      doneBtnText: "Finish",
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
          element: '.sidebar-nav',
          popover: {
            title: 'Navigation',
            description: 'Access the dashboard, browse openings, or connect with peers.',
            side: "right",
            align: 'start'
          }
        },
        {
          popover: {
            title: 'Welcome to RAMP!',
            description: 'You are all set to explore the Research, Academic & Mentorship Portal.',
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
  }, [startTour, onTourEnd]);

  return null;
}
