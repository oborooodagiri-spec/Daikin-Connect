"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Hide sidebar and margin on customers and units pages
  const isCustomerPage = pathname?.includes("/customers");
  const isUnitPage = pathname?.includes("/units/");
  
  // On unit detail pages, we want to remove the global header and global padding 
  // because the unit page has its own navigation and container.
  
  const showGlobalHeader = !isUnitPage;
  const showGlobalPadding = !isUnitPage;

  // Children are [Header, Main]
  const childrenArray = React.Children.toArray(children);
  const header = childrenArray[0];
  const content = childrenArray[1];

  return (
    <div className={`flex-1 transition-all duration-500 min-w-0 ${(isCustomerPage || isUnitPage) ? 'ml-0' : 'ml-0 md:ml-72'}`}>
      {showGlobalHeader && header}
      <main className={showGlobalPadding ? "p-4 md:p-8 lg:p-12" : ""}>
        {content}
      </main>
    </div>
  );
}
