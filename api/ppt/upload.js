export const config = {
  api: {
    bodyParser: false
  }
};

export async function handlePptUpload() {
  return {
    status: 410,
    body: {
      success: false,
      code: 'PPT_ROUND_CANCELLED',
      error: 'Online PPT upload has been cancelled. VELTRAXX 2.0 is now a single-round hackathon.'
    }
  };
}

export default async function handler(req, res) {
  const result = await handlePptUpload();
  return res.status(result.status).json(result.body);
}
