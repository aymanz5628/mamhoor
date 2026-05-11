"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Search } from "lucide-react";

interface SearchAndFilterProps {
  placeholder?: string;
  statuses?: { value: string; label: string }[];
}

export default function SearchAndFilter({ placeholder = "بحث...", statuses = [] }: SearchAndFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q") || "";
  const currentStatus = searchParams.get("status") || "ALL";

  const [searchQuery, setSearchQuery] = useState(currentQ);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "ALL") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== currentQ) {
        router.push(pathname + "?" + createQueryString("q", searchQuery));
      }
    }, 400); // debounce
    return () => clearTimeout(timer);
  }, [searchQuery, currentQ, pathname, router, createQueryString]);

  return (
    <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
      <div style={{ position: "relative", flex: "1", minWidth: "250px" }}>
        <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 40px 10px 12px",
            borderRadius: "8px",
            border: "1px solid var(--border-subtle)",
            fontFamily: "var(--font-body)",
            fontSize: "0.95rem",
            outline: "none",
            transition: "border-color 0.2s"
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--indigo)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
        />
      </div>

      {statuses.length > 0 && (
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          <button
            onClick={() => router.push(pathname + "?" + createQueryString("status", "ALL"))}
            style={{
              padding: "6px 16px",
              borderRadius: "20px",
              border: "1px solid",
              borderColor: currentStatus === "ALL" ? "var(--indigo)" : "var(--border-subtle)",
              background: currentStatus === "ALL" ? "var(--indigo)" : "var(--white)",
              color: currentStatus === "ALL" ? "var(--white)" : "var(--text-secondary)",
              fontFamily: "var(--font-heading)",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap"
            }}
          >
            الكل
          </button>
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => router.push(pathname + "?" + createQueryString("status", status.value))}
              style={{
                padding: "6px 16px",
                borderRadius: "20px",
                border: "1px solid",
                borderColor: currentStatus === status.value ? "var(--indigo)" : "var(--border-subtle)",
                background: currentStatus === status.value ? "var(--indigo)" : "var(--white)",
                color: currentStatus === status.value ? "var(--white)" : "var(--text-secondary)",
                fontFamily: "var(--font-heading)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap"
              }}
            >
              {status.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
