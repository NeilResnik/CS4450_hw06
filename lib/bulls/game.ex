
# STATE:
# guessHistory = [{guess: "", bulls: "", cows: ""}]
# gameState = ONE OF: "won", "lost", "playing"
# answer = ["1", "2", "3", "4"]

# methods
# checkGameState -> returns the game state after a guess is added to guess history
# guess -> adds a guess to guess history
# bullsAndCows -> check how many bulls and cows there are
# validateGuess -> check for no repeating vals
defmodule Bulls.Game do

    # I think that game state should store players
    # each player has a game history
    def new(name) do
        # gameState one of readyUp, playing
        %{
            players: %{},
            observers: %{},
            gameState: "waiting",
            answer: [],
            pendingGuesses: %{},
            prevWinners: [],
            leaderboard: %{},
            gameName: name
        }
    end

    # return a user safe state
    # TODO modify view to have user: players:
    def view(st) do
        st = Map.delete(st, :answer)
        Map.delete(st, :pendingGuesses)
    end

    # is all players ready?
    def allReady?(st) do
        Enum.reduce(st.players, true, fn({_id, info}, acc) ->
            acc and info.ready
        end) and (Enum.count(st.players) > 0)
    end

    # change a player between ready or not
    # do nothing if id is an observer
    # st: game
    # userId: int 
    # ready: bool
    def setReady(st, userId, ready) do
        # if game state is not waiting people can ready up!
        if st.gameState == "waiting" do
            # make sure the id exists in players (not an observer)
            if Map.has_key?(st.players, userId) do
                st = %{st | players: %{st.players | (userId) => %{st.players[userId] | ready: ready}}}
                # check if all players are now ready
                if allReady?(st) do
                    # set game state
                    st = %{st | gameState: "playing"}
                    # set answer
                    st = %{st | answer: randomAnswer([])}
                    # clear prev guesses
                    cleared = Enum.reduce(st.players, %{}, fn({id, val}, acc) ->
                        Map.put(acc, id, %{val | guesses: []})
                    end)

                    %{st | players: cleared}
                else
                    st
                end
            else
                st
            end
        else
            st
        end
    end

    # st: state
    # userId: int
    # player: bool: true if become player, false if become observer
    # -> return nil if too many players
    def modifyUser(st, userId, player) do
        # return nil if there are already 4 players
        if countPlayers(st) >= 4 do
            nil
        end

        # do nothing if game is in  progress
        if st.gameState == "playing" do
            st
        end
        
        if player do
            # turn an observer into a player
            name = st.observers[userId]
            if name do
                st = %{st | observers: Map.delete(st.observers, userId)}
                %{st | players: Map.put(st.players, userId, %{
                    user: name,
                    ready: false,
                    guesses: []
                })}
            else
                raise "trying to convert unkown id into player"
            end
        else
            # turn a player into an observer
            getPlayer = st.players[userId]
            if getPlayer do
                name = getPlayer.user
                st = %{st | players: Map.delete(st.players, userId)}
                %{st | observers: Map.put(st.observers, userId, name)}
            else
                raise "trying to convert unkown id into observer"
            end
        end

    end

    # count the number of players
    def countPlayers(st) do
        Enum.count(st.players)
    end

    # add a new player as an observer!
    # st: state
    # user: string: user name
    def addObserver(st, user) do
        id = totalMemberCount(st) + 1
        st = %{st | observers: Map.put(st.observers, id, user)}
        %{st | leaderboard: Map.put(st.leaderboard, id, %{user: user, wins: 0, losses: 0})}
    end

    # get number of players so far
    # state -> int
    def totalMemberCount(st) do
        Enum.count(st.players) + Enum.count(st.observers)
    end

    # TODO pass guesses from pending, check for winner, clear pendingGuesses
    def doGuesses(st) do
        # move guesses from pending to player's guesses
        players = Enum.reduce(st.pendingGuesses, st.players, fn({key, val}, acc) ->
            %{acc | (key) => %{acc[key] | guesses: [val | acc[key].guesses]}}
        end)
        st = %{st | players: players}

        st = %{st | pendingGuesses: %{}}
        # check for 4 bulls
        winners = getWinnersId(st)
        if winners do
            # anyone who has 4 bulls is previous winner
            # add wins/losses to leaderboard
            st = %{st | prevWinners: getWinnersName(st)}
            st = %{st | leaderboard: updateLeaderBoard(st.leaderboard, winners)}
            # set state to waiting
            %{st | gameState: "waiting"}
        else
            st
        end
    end

    # return list of winner id's or nil
    def getWinnersId(st) do
        # get a list of userIds that won
        winners = Enum.reduce(st.players, [], fn({key, val}, acc) ->
            if hd(val.guesses).bulls == 4 do
                [key | acc]
            else
                acc
            end
        end)

        # if we have a winner, return the list, otherwise give up
        if Enum.count(winners) > 0 do
            winners
        else
            nil
        end
    end
    # return list of winner names
    def getWinnersName(st) do
        # get a list of userIds that won
        Enum.reduce(st.players, [], fn({_key, val}, acc) ->
            if hd(val.guesses).bulls == 4 do
                [val.user | acc]
            else
                acc
            end
        end)
    end
    # return a new leaderboard
    def updateLeaderBoard(lb, winners) do
        Enum.reduce(lb, %{}, fn({key, val}, acc) ->
            if Enum.member?(winners, key) do
                Map.put(acc, key, %{val | wins: val.wins + 1})
            else
                Map.put(acc, key, %{val | wins: val.losses + 1})
            end
        end)
    end

    # TODO: modify this to take (st, arr, user)
    # input : old state
    # output : new state
    # validate guess, determine bulls and cows
    def addGuess(st, userId, arr) do
        if (st.gameState == "playing") && validGuess?(arr) do
            # calculate bulls and cows
            bulls = bulls(st.answer, arr, 0)
            cows = cows(st.answer, arr, 0) - bulls

            if Map.has_key?(st.pendingGuesses, userId) do
                # user has already guessed
                nil
            else
                %{ st | pendingGuesses: Map.put(st.pendingGuesses, userId, %{guess: Enum.join(arr, ""), bulls: bulls, cows: cows})}
            end
        else
            # invalid guess just return the old state
            nil
        end
    end

    # ensure a guess is len 4, only strings of single digit numbers
    # also make sure unique
    def validGuess?(arr) do
        unless length(arr) == 4 do
            false
        end
        
        unless eachValid?(arr) do
            false
        end

        # check for duplicates
        length(Enum.uniq(arr)) == 4
    end

    # recurr down curArr, check for duplicates using fullArr
    # also check for single digit string status
    def eachValid?([cur | rest]) do
        # ensure that cur val is an int
        unless isAnInt?(cur) do
            false
        end

        # ensure the length of cur val is 1
        unless String.length(cur) == 1 do
            false
        end

        eachValid?(rest)
    end

    # base case
    def eachValid?([]) do
        true
    end

    # ensure a string is an int
    defp isAnInt?(str) do
        case Integer.parse(str) do
            {_num, ""} -> true
            _ -> false
        end
    end

    # recur through and check for where ans == guess
    def bulls([curAns | restAns], [curGuess | restGuess], acc) do
        if curAns == curGuess do
            bulls(restAns, restGuess, acc + 1)
        else
            bulls(restAns, restGuess, acc)
        end
    end

    # base case
    def bulls([], [], acc) do
        acc
    end

    # check if answer contains each val in guess 
    def cows(answer, [curGuess | restGuess], acc) do
        if Enum.member?(answer, curGuess) do
            cows(answer, restGuess, acc + 1)
        else
            cows(answer, restGuess, acc)
        end
    end

    # base case
    def cows(_answer, [], acc) do
        acc
    end

    # create a random answer/secret of unique random nums
    # ["#", "#", "#", "#"]
    def randomAnswer(arr) do
        # return arr if we have 4 vals, otherwise add another
        if length(arr) == 4 do
            arr
        else
            # generate random number, convert to string
            randVal = Integer.to_string(:rand.uniform(9))

            # If we already have that number, generate another
            if Enum.member?(arr, randVal) do
                randomAnswer(arr)
            else
                # this is a new number, add it to the list
                randomAnswer([randVal | arr])
            end
        end
    end

end