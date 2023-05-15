$(document).ready(function () {
    $("button.removeMember").click(function () {
        console.log("remove member");
        var memberEmail = $(this).attr("id");
        var memberName = $(this).attr("memberName");
        console.log(memberEmail)
        console.log(memberName)
        $("#modal-title-remove").text("Remove " + memberName + " from the group?");
        $("#modal-body-remove").html(`
            <p>${memberName} will lose access to the group's itinerary plan, chatroom history, and expense tracker!</p>
            <input type="hidden" name="memberEmail" id="memberEmail" value="${memberEmail}">
            `);
    });
});