import React from "react";
import { Resident } from "../../types/index"; // sesuaikan path

const AGE_GROUPS: [number, number | null][] = [
  [0, 4],
  [5, 9],
  [10, 14],
  [15, 19],
  [20, 24],
  [25, 29],
  [30, 34],
  [35, 39],
  [40, 44],
  [45, 49],
  [50, 54],
  [55, 59],
  [60, 64],
  [65, 69],
  [70, 74],
  [75, null],
];

const groupResidentsByRWRT = (residents: Resident[]) => {
  const result: Record<string, Record<string, Resident[]>> = {};

  residents.forEach((r) => {
    const rw = r.rw || "000";
    const rt = r.rt || "000";

    if (!result[rw]) result[rw] = {};
    if (!result[rw][rt]) result[rw][rt] = [];

    result[rw][rt].push(r);
  });

  return result;
};

const getAge = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const MonografiUmur = ({ residents }: { residents: Resident[] }) => {
  const grouped = groupResidentsByRWRT(residents);

  return (
    <div className="space-y-10">
      {Object.entries(grouped).map(([rw, rtData], rwIndex) => (
        <div key={rw}>
          <h2 className="font-bold text-lg mb-2">
            NO RW : {rw.padStart(3, "0")}
          </h2>
          <table className="table-auto border border-collapse w-full text-xs">
            <thead>
              <tr className="bg-gray-200">
                <th rowSpan={2}>NO</th>
                <th rowSpan={2}>NO RT</th>
                {AGE_GROUPS.map(([min, max]) => (
                  <th key={`${min}-${max ?? "+"}`} colSpan={3}>
                    {max === null ? "≥75" : `${min}-${max}`}
                  </th>
                ))}
                <th colSpan={3}>JUMLAH</th>
              </tr>
              <tr className="bg-gray-100">
                {AGE_GROUPS.map(() => (
                  <>
                    <th>L</th>
                    <th>P</th>
                    <th>L+P</th>
                  </>
                ))}
                <th>L</th>
                <th>P</th>
                <th>L+P</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(rtData).map(([rt, list], idx) => {
                const ageGroupCounts = AGE_GROUPS.map(([min, max]) => {
                  const group = list.filter((r) => {
                    const age = getAge(r.birthDate);
                    return age >= min && (max === null || age <= max);
                  });
                  const l = group.filter(
                    (r) => r.gender === "Laki-laki"
                  ).length;
                  const p = group.filter(
                    (r) => r.gender === "Perempuan"
                  ).length;
                  return [l, p, l + p];
                });

                const totalL = list.filter(
                  (r) => r.gender === "Laki-laki"
                ).length;
                const totalP = list.filter(
                  (r) => r.gender === "Perempuan"
                ).length;

                return (
                  <tr key={rt} className="text-center">
                    <td>{idx + 1}</td>
                    <td>{`RT.${rt.padStart(3, "0")}`}</td>
                    {ageGroupCounts.map(([l, p, t], i) => (
                      <React.Fragment key={i}>
                        <td>{l}</td>
                        <td>{p}</td>
                        <td>{t}</td>
                      </React.Fragment>
                    ))}
                    <td>{totalL}</td>
                    <td>{totalP}</td>
                    <td>{totalL + totalP}</td>
                  </tr>
                );
              })}

              {/* TOTAL PER RW */}
              <tr className="bg-gray-100 font-semibold text-center">
                <td colSpan={2}>JML RW : {rw}</td>
                {AGE_GROUPS.map(([min, max]) => {
                  const group = Object.values(rtData)
                    .flat()
                    .filter((r) => {
                      const age = getAge(r.birthDate);
                      return age >= min && (max === null || age <= max);
                    });
                  const l = group.filter(
                    (r) => r.gender === "Laki-laki"
                  ).length;
                  const p = group.filter(
                    (r) => r.gender === "Perempuan"
                  ).length;
                  return (
                    <React.Fragment key={`${min}-${max}`}>
                      <td>{l}</td>
                      <td>{p}</td>
                      <td>{l + p}</td>
                    </React.Fragment>
                  );
                })}
                <td>
                  {
                    Object.values(rtData)
                      .flat()
                      .filter((r) => r.gender === "Laki-laki").length
                  }
                </td>
                <td>
                  {
                    Object.values(rtData)
                      .flat()
                      .filter((r) => r.gender === "Perempuan").length
                  }
                </td>
                <td>{Object.values(rtData).flat().length}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default MonografiUmur;
