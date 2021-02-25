
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
            answer: randomAnswer([]),
            gameName: name
        }
    end

    # return a user safe state
    # TODO modify view to have user: players:
    def view(st) do
        Map.delete(st, :answer)
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
        if Map.has_key?(st.players, userId) do
            st = %{st | players: %{st.players | (userId) => %{st.players[userId] | ready: ready}}}
            if allReady?(st) do
                %{st | gameState: "playing"}
            else
                st
            end
        else
            st
        end
    end

    # TODO modify a user!
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
        %{st | observers: Map.put(st.observers, id, user)}
    end

    # get number of players so far
    # state -> int
    def totalMemberCount(st) do
        Enum.count(st.players) + Enum.count(st.observers)
    end

    # TODO: modify this to take (st, arr, user)
    # input : old state
    # output : new state
    # validate guess, determine bulls and cows
    def guess(st, arr) do
        if (st.gameState == "playing") && validGuess?(arr) do
            # calculate bulls and cows
            bulls = bulls(st.answer, arr, 0)
            cows = cows(st.answer, arr, 0) - bulls

            # modify guess history
            st1 = %{ st | guessHistory: [ %{guess: Enum.join(arr, ""), bulls: "#{bulls}", cows: "#{cows}"} | st.guessHistory ] }

            state = getState(st1.guessHistory)

            # add in game state
            %{st1 | gameState: state }
        else
            # invalid guess just return the old state
            st 
        end
    end

    # TODO: modify this to change "playing" -> "waiting" when someone wins
    # get the current game state after a guess
    def getState(history) do
        if hd(history).bulls == "4" do
            "won"
        else
            if length(history) >= 8 do
                "lost"
            else
                "playing"
            end
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