async function getPincodeData(pincode: string) {
  try {
    // Use the correct URL
    const res = await fetch(`http://www.postalpincode.in/api/pincode/${pincode}`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.error(`Pincode API returned ${res.status}`);
      return { ok: false };
    }

    const data = await res.json();

    if (!data?.[0] || data[0].Status !== "Success") {
      return { ok: false };
    }

    const postOffice = data[0].PostOffice?.[0];
    if (!postOffice) {
      return { ok: false };
    }

    return {
      ok: true,
      state: postOffice.State,
      district: postOffice.District,
      city: postOffice.Region,
    };
  } catch (error) {
    console.error("Pincode API fetch failed:", error);
    return { ok: false };
  }
}