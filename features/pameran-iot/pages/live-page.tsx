"use client";

import { Trophy, Activity, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { getLiveVoteData } from "../actions/get-teams";

export default function LivePage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const fetchLeaderboard = async () => {
      try {
        const data = await getLiveVoteData(); // Optionally filter by session ID if needed
        setLeaderboard(data);
      } catch (error) {
        console.error("Failed to fetch live data:", error);
      }
    };

    fetchLeaderboard(); // Initial fetch
    
    // Poll every 5 seconds
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const topVotes = Math.max(...leaderboard.map(item => item.votes));
  const totalVotes = leaderboard.reduce((acc, curr) => acc + curr.votes, 0);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-sm font-bold text-green-400">
          <Activity className="w-4 h-4 animate-pulse" />
          KLASEMEN SEMENTARA
        </div>
        
        <h1 className="flex flex-col items-center gap-1">
          <span className="text-3xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-200 to-amber-400">
            LIVE VOTE SCORE
          </span>
          <span className="text-3xl md:text-5xl font-black tracking-tighter text-white">
            PAMERAN IoT
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
          Peringkat terkini berdasarkan suara pengunjung.
        </p>

        {/* Stats Row */}
        <div className="flex justify-center gap-4 mt-8">
          <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-400" />
            <div className="text-left">
              <div className="text-xs text-gray-400 font-medium uppercase">Total Suara</div>
              <div className="text-xl font-black text-white">{totalVotes}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Leaderboard List */}
      <div className="max-w-4xl mx-auto mt-16 space-y-4">
        {leaderboard.map((item, index) => {
          // Calculate percentage width relative to the highest vote count (so the top team is always 100% full width)
          const percentage = Math.max((item.votes / topVotes) * 100, 2); // min 2% so it's visible
          
          return (
            <div 
              key={item.id} 
              className="group relative bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 overflow-hidden transition-all hover:bg-white/10"
            >
              {/* Background Bar */}
              <div 
                className={`absolute top-0 bottom-0 left-0 bg-gradient-to-r transition-all duration-1000 ease-out z-0 opacity-20
                  ${index === 0 ? "from-yellow-600 to-yellow-400" : 
                    index === 1 ? "from-gray-500 to-gray-300" : 
                    index === 2 ? "from-amber-700 to-amber-600" : "from-blue-600 to-blue-400"}
                `}
                style={{ width: mounted ? `${percentage}%` : "0%" }}
              />
              
              <div className="relative z-10 flex items-center gap-4 sm:gap-6">
                {/* Rank Number */}
                <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl font-black text-xl
                  ${index === 0 ? "bg-gradient-to-br from-yellow-400 to-amber-600 text-black shadow-lg shadow-yellow-500/20" : 
                    index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-500 text-black" : 
                    index === 2 ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white" : "bg-white/10 text-white"}
                `}>
                  {index === 0 ? <Trophy className="w-6 h-6 fill-black/20" /> : `#${index + 1}`}
                </div>
                
                {/* Team Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-black/30 text-blue-400 border border-blue-400/20">
                      {item.code}
                    </span>
                    <span className="text-sm font-medium text-gray-400 truncate">
                      Tim {item.team}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </h3>
                </div>

                {/* Vote Count */}
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {item.votes}
                  </div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    Suara
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
