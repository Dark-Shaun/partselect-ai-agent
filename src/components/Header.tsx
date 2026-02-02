"use client";

import { Refrigerator, WashingMachine } from "lucide-react";

export const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">PS</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PartSelect</h1>
              <p className="text-xs text-gray-500">AI Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <Refrigerator size={18} className="text-blue-600" />
              <span>Refrigerator</span>
              <span className="text-gray-300">|</span>
              <WashingMachine size={18} className="text-blue-600" />
              <span>Dishwasher</span>
            </div>
            <a
              href="https://www.partselect.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Visit PartSelect.com
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
