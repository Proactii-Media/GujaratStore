import { getUserByIdForAdmin } from "@/lib/actions/admin/user.actions";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await params;
    const response = await getUserByIdForAdmin(userId);

    if (!response.success) {
      return NextResponse.json(response, { status: 404 });
    }

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}



// export async function DELETE(
//   request: Request,
//   { params }: { params: { userId: string } }
// ) {
//   try {
//     const { userId } = params;

//     await connectToDB();

//     const deletedUser = await User.findByIdAndDelete(userId);

//     if (!deletedUser) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Customer not found",
//         },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Customer deleted successfully",
//     });
//   } catch (error) {
//     return NextResponse.json(
//       {
//         success: false,
//         error: error instanceof Error
//           ? error.message
//           : "An error occurred",
//       },
//       { status: 500 }
//     );
//   }
// }