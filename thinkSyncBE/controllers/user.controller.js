import { prisma } from "../config/db.js";
import { ApiResponce } from "../utils/ApiResponse.js";

const updateDetails = async (req, res) => {
  const { displayName, email, username, ...detailsFields } = req.body;

  try {
    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser && existingUser.id !== req.user.id) {
        return res
          .status(400)
          .json({ error: "Username is already taken. Please choose another." });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        displayName,
        email,
        username,
        details: {
          update: {
            ...detailsFields,
          },
        },
      },
      include: { details: true },
    });

    return res
      .status(200)
      .json(new ApiResponce(200, updatedUser, "User details updated"));
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message,
    });
  }
};

const me = (req, res) => {
  res.json(req.user);
};

export { me, updateDetails };
