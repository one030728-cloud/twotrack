import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DataTable, type DataTableColumn } from "./data-table";

interface Row {
  id: number;
  name: string;
}

const rows: Row[] = [
  { id: 1, name: "하루분식" },
  { id: 2, name: "가나상점" },
];
const columns: DataTableColumn<Row>[] = [
  {
    key: "name",
    label: "상호명",
    initialWidth: 180,
    minWidth: 130,
    sortable: true,
    sortValue: (row) => row.name,
    render: (row) => row.name,
  },
];

describe("DataTable", () => {
  it("헤더 정렬과 키보드 열 너비 조절을 지원한다", async () => {
    const user = userEvent.setup();
    render(
      <DataTable rows={rows} columns={columns} getRowId={(row) => row.id} />,
    );

    await user.click(screen.getByRole("button", { name: "상호명 정렬" }));
    const bodyRows = screen.getAllByRole("row").slice(1);
    expect(within(bodyRows[0]).getByText("가나상점")).toBeInTheDocument();

    const resize = screen.getByRole("separator", {
      name: "상호명 열 너비 조절",
    });
    fireEvent.keyDown(resize, { key: "ArrowLeft" });
    expect(resize).toHaveAttribute("aria-valuenow", "170");
  });

  it("pageSize가 실제 행 수보다 커도 빈 행을 추가하지 않는다", () => {
    render(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        pageSize={50}
      />,
    );

    expect(screen.getAllByRole("row")).toHaveLength(rows.length + 1);
  });
});
