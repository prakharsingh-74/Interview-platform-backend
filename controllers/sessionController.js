const Session = require("../models/Session");
const Question = require("../models/Question");

//@desc a new session and linked questions
//@route POST /api/sessions/create
//@access private 
exports.createSession = async (req, res) => {
    try {
        const { role, experience, topicsToFocus, description, questions } = req.body;
        const userId = req.user._id; //middleware setting req.user
        const session = await Session.create({
            user: userId,
            role,
            experience,
            topicsToFocus,
            description,
        });

        const questionDocs = await Promise.all(
            questions.map(async(q)=>{
                const question = await Question.create({
                    session: session._id,
                    question: q.question,
                    answer: q.answer,
                });
                return question._id;
            })
        );

        session.questions = questionDocs;
        await session.save();
        res.status(201).json({ success: true, session });

    } catch (error) {
        res.status(500).json({success:false, message: "Server error"});
    }
}

//@desc get all sessions for the logged in user
//@route GET /api/sessions/my-sessions
//@access private 
exports.getMySessions = async (req, res) => {
    try {
        const sessions = await Session.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .populate("questions");
        res.status(200).json(sessions);
    } catch (error) {
        res.status(500).json({success:false, message: "Server error"});
    }
};

//@desc a session by id with populated questions
//@route GET /api/sessions/:id
//@access private 
exports.getSessionById = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id)
        .populate({
            path: "questions",
            options: { sort: { isPinned: -1 } },
        })
        .exec();

        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }

        res.status(200).json({ success: true, session });
    } catch (error) {
        res.status(500).json({success:false, message: "Server error"});
    }
}

//@desc a delete session and its questions
//@route DELETE /api/sessions/:id
//@access private 
exports.deleteSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }

        //checked if the logged in user owns this session
        if (session.user.toString() !== req.user.id){
            return res.status(401).json({ message: "not authorized to delete this session" });
       }

       //first delete all the sessions linked to this session
       await Question.deleteMany({ session: session._id });

       //then delete the session
       await session.deleteOne();
       
       res.status(200).json({ success: true, message: "Session deleted successfully" });
    }

      catch (error) {
        res.status(500).json({success:false, message: "Server error"});
    }
}